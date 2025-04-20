package client

import (
	response_dtos "chat_hub/core/domain/dtos/response"
	"chat_hub/infrastructure/client/base"
	"chat_hub/kernel/utils"
	"encoding/json"
)

type AuthAdapter struct {
	adapter *AuthAdapter
}

func NewAuthAdapter() *AuthAdapter {
	return &AuthAdapter{
		adapter: &AuthAdapter{},
	}
}

func (adapter *AuthAdapter) GetUserLLMModelConfig(userId string) (response_dtos.UserLLMModelConfigDTO, error) {
	userLLMModelConfigURL := base.AuthServiceURL + "/get-llm-config/" + userId
	var userLLMModelConfig response_dtos.UserLLMModelConfigDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userLLMModelConfigURL, "GET", nil, headers)
	if err != nil {
		return response_dtos.UserLLMModelConfigDTO{}, err
	}

	data, err := json.Marshal(bodyResult)
	if err != nil {
		return response_dtos.UserLLMModelConfigDTO{}, err
	}

	err = json.Unmarshal(data, &userLLMModelConfig)
	if err != nil {
		return response_dtos.UserLLMModelConfigDTO{}, err
	}

	return userLLMModelConfig, nil
}