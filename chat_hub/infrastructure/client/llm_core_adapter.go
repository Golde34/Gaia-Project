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

func (adapter *LLMCoreAdapter) UserPrompt(input request_dtos.LLMQueryRequestDTO) (map[string]interface{}, error) {
	userPrompURL := base.LLMCoreServiceURL + "/chat"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userPrompURL, enums.POST, input, headers)
	if err != nil {
		log.Fatal("Cannot connect with Gaia Bot, try later: ", err)
		return nil, err
	}

	log.Println("Response from LLMCoreAdapter: ", bodyResult)
	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		log.Fatal("Error converting response to map: ", bodyResult)
		return nil, err
	}

	log.Println("Response map from LLMCoreAdapter: ", bodyResultMap)
	

	return bodyResultMap, nil
}