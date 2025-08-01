package client

import (
	"bufio"
	request_dtos "chat_hub/core/domain/dtos/request"
	"chat_hub/infrastructure/client/base"
	"chat_hub/kernel/utils"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
)

type LLMCoreAdapter struct{}

func NewLLMCoreAdapter() *LLMCoreAdapter {
	return &LLMCoreAdapter{}
}

func (adapter *LLMCoreAdapter) handleSSERequest(endpoint string, input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	sseURL := base.LLMCoreServiceURL + endpoint

	params := url.Values{}
	params.Add("dialogue_id", input.DialogueId)
	params.Add("message", input.Content)
	params.Add("model_name", input.UserModel)
	params.Add("user_id", input.UserId)

	fullURL := fmt.Sprintf("%s?%s", sseURL, params.Encode())

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		log.Printf("Error creating SSE request for %s: %v", endpoint, err)
		return nil, err
	}

	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Connection", "keep-alive")

	for key, value := range utils.BuildDefaultHeaders() {
		req.Header.Set(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Cannot connect with Gaia Bot SSE (%s), try later: %v", endpoint, err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("SSE request failed with status: %d for endpoint: %s", resp.StatusCode, endpoint)
		return nil, fmt.Errorf("SSE request failed with status: %d", resp.StatusCode)
	}

	fullResponse := ""
	scanner := bufio.NewScanner(resp.Body)

	for scanner.Scan() {
		line := scanner.Text()

		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")

			var eventData map[string]interface{}
			if err := json.Unmarshal([]byte(data), &eventData); err == nil {
				if chunk, ok := eventData["chunk"].(string); ok {
					fullResponse += chunk
				}

				if isFinal, ok := eventData["is_final"].(bool); ok && isFinal {
					break
				}

				if fullResp, ok := eventData["full_response"].(string); ok {
					fullResponse = fullResp
					break
				}

				if errorMsg, ok := eventData["error"].(string); ok {
					log.Printf("Error from AI Core SSE (%s): %s", endpoint, errorMsg)
					return nil, fmt.Errorf("AI Core error: %s", errorMsg)
				}
			}
		} else if strings.HasPrefix(line, "event: ") {
			eventType := strings.TrimPrefix(line, "event: ")
			if eventType == "message_complete" || eventType == "error" {
				continue
			}
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("Error reading SSE stream for %s: %v", endpoint, err)
		return nil, err
	}

	fullResponse = strings.ReplaceAll(fullResponse, "\n\n", " ")
	fullResponse = strings.ReplaceAll(fullResponse, "\r\n", " ")
	fullResponse = strings.TrimSpace(fullResponse)

	log.Printf("Full Response from LLMCoreAdapter SSE (%s): %s", endpoint, fullResponse)

	result := map[string]interface{}{
		"response": fullResponse,
	}

	return result, nil
}

func (adapter *LLMCoreAdapter) ChatForTask(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	return adapter.handleSSERequest("/chat/send-message", input)
}

func (adapter *LLMCoreAdapter) ChatForOnboarding(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	return adapter.handleSSERequest("/chat/onboarding/introduce-gaia", input)
}

func (adapter *LLMCoreAdapter) ChatForRegisterCalendar(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	return adapter.handleSSERequest("/chat/onboarding/register-calendar", input)
}
