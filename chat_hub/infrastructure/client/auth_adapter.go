package client

import (
	response_dtos "chat_hub/core/domain/dtos/response"
	"chat_hub/infrastructure/client/base"
	"chat_hub/kernel/utils"
	"encoding/json"
	"fmt"
	"log"
)

type AuthAdapter struct {
	adapter *AuthAdapter
}

func NewAuthAdapter() *AuthAdapter {
	return &AuthAdapter{
		adapter: &AuthAdapter{},
	}
}

func (adapter *AuthAdapter) ValidateServiceJwt(jwt string) (string, error) {
	serviceName := "ChatHub"
	authServiceURL := base.AuthServiceURL + "/auth/admin/validate-service-jwt"
	headers := utils.BuildAuthorizationHeaders("authentication_service", "1")
	body := map[string]interface{}{
		"service": serviceName,
		"jwt":     jwt,
	}
	bodyResult, err := utils.BaseAPI(authServiceURL, "POST", body, headers)
	if err != nil {
		return "", err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("failed to convert object: %w", err)
	}

	return bodyResultMap["message"].(string), nil
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

func (adapter *AuthAdapter) CheckToken(token string) (response_dtos.TokenResponse, error) {
	authServiceURL := base.AuthServiceURL + "/auth/check-token"
	headers := utils.BuildDefaultHeaders()
	input := map[string]interface{}{
		"token": token,
	}
	bodyResult, err := utils.BaseAPI(authServiceURL, "GET", input, headers)
	if err != nil {
		return response_dtos.TokenResponse{}, err
	}
	bodyMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return response_dtos.TokenResponse{}, err
	}

	dataBytes, err := utils.ConvertResponseToMap(bodyMap["message"])
	if err != nil {
		return response_dtos.TokenResponse{}, err
	}
	var tokenResponse response_dtos.TokenResponse 
	err = json.Unmarshal(dataBytes, &tokenResponse)
	if err != nil {
		return response_dtos.TokenResponse{}, err
	}

	log.Println("Token response: ", tokenResponse)
	return tokenResponse, nil
}

func (adapter *AuthAdapter) RefreshToken(refreshToken string) (string, error) {
	authServiceURL := base.AuthServiceURL + "/auth/refresh-token"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(authServiceURL, "POST", refreshToken, headers)
	if err != nil {
		return "", err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return "Cannot convert the response to map", err
	}

	newAccessToken, ok := bodyResultMap["message"].(string)
	if !ok {
		return "Cannot convert the response to string", err
	}

	return newAccessToken, nil
}
