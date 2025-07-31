package client

import (
	"bufio"
	request_dtos "chat_hub/core/domain/dtos/request"
	"chat_hub/core/domain/enums"
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

func (adapter *LLMCoreAdapter) ChatForTask(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	// Use SSE endpoint instead of regular POST
	sseURL := base.LLMCoreServiceURL + "/chat/send-message"

	// Build query parameters for SSE request
	params := url.Values{}
	params.Add("dialogue_id", input.DialogueId)
	params.Add("message", input.Content)
	params.Add("type", "abilities")
	params.Add("sse_token", "chat_hub_token") // You might want to generate a proper token

	fullURL := fmt.Sprintf("%s?%s", sseURL, params.Encode())

	// Create HTTP request for SSE
	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		log.Println("Error creating SSE request: ", err)
		return nil, err
	}

	// Set SSE headers
	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Connection", "keep-alive")

	// Add default headers
	for key, value := range utils.BuildDefaultHeaders() {
		req.Header.Set(key, value)
	}

	// Make the SSE request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Cannot connect with Gaia Bot SSE, try later: ", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("SSE request failed with status: %d", resp.StatusCode)
		return nil, fmt.Errorf("SSE request failed with status: %d", resp.StatusCode)
	}

	// Read SSE stream
	fullResponse := ""
	scanner := bufio.NewScanner(resp.Body)

	for scanner.Scan() {
		line := scanner.Text()

		// Parse SSE event
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")

			// Try to parse JSON data
			var eventData map[string]interface{}
			if err := json.Unmarshal([]byte(data), &eventData); err == nil {
				// Handle different event types
				if chunk, ok := eventData["chunk"].(string); ok {
					fullResponse += chunk
				}

				// Check if this is the final chunk
				if isFinal, ok := eventData["is_final"].(bool); ok && isFinal {
					break
				}

				// Check for completion event
				if fullResp, ok := eventData["full_response"].(string); ok {
					fullResponse = fullResp
					break
				}

				// Check for error
				if errorMsg, ok := eventData["error"].(string); ok {
					log.Printf("Error from AI Core SSE: %s", errorMsg)
					return nil, fmt.Errorf("AI Core error: %s", errorMsg)
				}
			}
		} else if strings.HasPrefix(line, "event: ") {
			eventType := strings.TrimPrefix(line, "event: ")
			if eventType == "message_complete" || eventType == "error" {
				// Continue to read the data line
				continue
			}
		}
	}

	if err := scanner.Err(); err != nil {
		log.Println("Error reading SSE stream: ", err)
		return nil, err
	}

	log.Println("Full Response from LLMCoreAdapter SSE: ", fullResponse)

	// Return response in the expected format
	result := map[string]interface{}{
		"response": fullResponse,
	}

	return result, nil
}

func (adapter *LLMCoreAdapter) ChatForOnboarding(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	userPrompURL := base.LLMCoreServiceURL + "/onboarding/introduce-gaia"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userPrompURL, enums.POST, input, headers)
	if err != nil {
		log.Println("Cannot connect with Gaia Bot, try later: ", err)
		return nil, err
	}

	log.Println("Response from LLMCoreAdapter: ", bodyResult)
	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		log.Println("Error converting response to map: ", bodyResult)
		return nil, err
	}

	log.Println("Response map from LLMCoreAdapter: ", bodyResultMap)

	return bodyResultMap, nil
}

func (adapter *LLMCoreAdapter) ChatForRegisterCalendar(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	userPrompURL := base.LLMCoreServiceURL + "/onboarding/register-calendar"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userPrompURL, enums.POST, input, headers)
	if err != nil {
		log.Println("Cannot connect with Gaia Bot, try later: ", err)
		return nil, err
	}

	log.Println("Response from LLMCoreAdapter: ", bodyResult)
	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		log.Println("Error converting response to map: ", bodyResult)
		return nil, err
	}

	log.Println("Response map from LLMCoreAdapter: ", bodyResultMap)

	return bodyResultMap, nil
}
