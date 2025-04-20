package client

import (
	"chat_hub/infrastructure/client/base"
	"chat_hub/kernel/utils"
	"log"
)

type LLMCoreAdapter struct{}

func NewLLMCoreAdapter() *LLMCoreAdapter {
	return &LLMCoreAdapter{}
}

func (adapter *LLMCoreAdapter) UserPrompt(userId, message string) (string, error) {
	log.Println("Sending user prompt to LLMCoreAdapter for user ID: " + message)
	userPrompURL := base.LLMCoreServiceURL + "/chat-hub/user-prompt/" + userId
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userPrompURL, "GET", nil, headers)
	if err != nil {
		return "Cannot connect with Gaia Bot, try later", err
	}

	bodyeResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return "Internal System Error", nil
	}

	data, exists := bodyeResultMap["response"].(string)
	if !exists || data == "" {
		return "Internal System Error", err
	}

	return data, nil
}