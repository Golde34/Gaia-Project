package client

import (
	request_dtos "chat_hub/core/domain/dtos/request"
	"chat_hub/core/domain/enums"
	"chat_hub/infrastructure/client/base"
	"chat_hub/kernel/utils"
	"log"
)

type LLMCoreAdapter struct{}

func NewLLMCoreAdapter() *LLMCoreAdapter {
	return &LLMCoreAdapter{}
}

func (adapter *LLMCoreAdapter) UserPrompt(input request_dtos.LLMQueryRequestDTO) (string, error) {
	userPrompURL := base.LLMCoreServiceURL + "/chat"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userPrompURL, enums.POST, input, headers)
	if err != nil {
		return "Cannot connect with Gaia Bot, try later", err
	}

	log.Println("Response from LLMCoreAdapter: ", bodyResult)
	bodyeResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return "Internal System Error", nil
	}

	log.Println("Response map from LLMCoreAdapter: ", bodyeResultMap)
	data, exists := bodyeResultMap["response"].(string)
	if !exists || data == "" {
		return "Internal System Error", err
	}

	return data, nil
}