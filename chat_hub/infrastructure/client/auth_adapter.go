package client

import (
	response_dtos "chat_hub/core/domain/dtos/response"
	"chat_hub/infrastructure/client/base"
	"chat_hub/kernel/utils"
	"encoding/json"
	"fmt"
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
	userLLMModelConfigURL := base.AuthServiceURL + "/user-model-setting/get-model-by-user?userId=" + userId
	var userLLMModelConfig response_dtos.UserLLMModelConfigDTO
	headers := utils.BuildAuthorizationHeaders("authentication_service", userId)
	bodyResult, err := utils.BaseAPI(userLLMModelConfigURL, "GET", nil, headers)
	if err != nil {
		return response_dtos.UserLLMModelConfigDTO{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return response_dtos.UserLLMModelConfigDTO{}, fmt.Errorf("failed to convert object: %w", err) 
	}
	data, err := json.Marshal(bodyResultMap["message"])
	if err != nil {
		return response_dtos.UserLLMModelConfigDTO{}, err
	}
	err = json.Unmarshal(data, &userLLMModelConfig)
	if err != nil {
		return response_dtos.UserLLMModelConfigDTO{}, err
	}

	return userLLMModelConfig, nil
}