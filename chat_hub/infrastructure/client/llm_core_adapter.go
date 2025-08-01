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

// Helper function to handle SSE requests
func (adapter *LLMCoreAdapter) handleSSERequest(endpoint string, input request_dtos.BotMessageRequestDTO, chatType string) (map[string]interface{}, error) {
	// Use SSE endpoint
	sseURL := base.LLMCoreServiceURL + endpoint

	// Build query parameters for SSE request
	params := url.Values{}
	params.Add("dialogue_id", input.DialogueId)
	params.Add("message", input.Content)
	params.Add("model_name", input.UserModel)
	params.Add("user_id", input.UserId)

	fullURL := fmt.Sprintf("%s?%s", sseURL, params.Encode())

	// Create HTTP request for SSE
	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		log.Printf("Error creating SSE request for %s: %v", endpoint, err)
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
		log.Printf("Cannot connect with Gaia Bot SSE (%s), try later: %v", endpoint, err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("SSE request failed with status: %d for endpoint: %s", resp.StatusCode, endpoint)
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
					// Use the full response from completion event instead of concatenated chunks
					fullResponse = fullResp
					break
				}

				// Check for error
				if errorMsg, ok := eventData["error"].(string); ok {
					log.Printf("Error from AI Core SSE (%s): %s", endpoint, errorMsg)
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
		log.Printf("Error reading SSE stream for %s: %v", endpoint, err)
		return nil, err
	}

	// Clean the response text to ensure no extra formatting issues
	fullResponse = strings.ReplaceAll(fullResponse, "\n\n", " ")
	fullResponse = strings.ReplaceAll(fullResponse, "\r\n", " ")
	fullResponse = strings.TrimSpace(fullResponse)

	log.Printf("Full Response from LLMCoreAdapter SSE (%s): %s", endpoint, fullResponse)

	// Return response in the expected format
	result := map[string]interface{}{
		"response": fullResponse,
	}

	return result, nil
}

func (adapter *LLMCoreAdapter) ChatForTask(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	return adapter.handleSSERequest("/chat/send-message", input, "abilities")
}

func (adapter *LLMCoreAdapter) ChatForOnboarding(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	return adapter.handleSSERequest("/chat/onboarding/introduce-gaia", input, "abilities")
}

func (adapter *LLMCoreAdapter) ChatForRegisterCalendar(input request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	return adapter.handleSSERequest("/chat/onboarding/register-calendar", input, "abilities")
}
