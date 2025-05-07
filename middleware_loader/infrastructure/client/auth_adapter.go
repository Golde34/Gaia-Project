package client_adapter

import (
	"encoding/json"
	"log"

	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/domain/enums"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
)

type AuthAdapter struct {
	adapter *AuthAdapter
}

func NewAuthAdapter(adapter *AuthAdapter) *AuthAdapter {
	return &AuthAdapter{adapter: adapter}
}

func (adapter *AuthAdapter) Signin(input model.SigninInput) (response_dtos.AuthTokenResponseDTO, error) {
	authToken, err := adapter.callSigninAuthService(input)
	if err != nil {
		return response_dtos.AuthTokenResponseDTO{}, err
	}

	if authToken.Role == enums.Boss {
		gaiaHealth, err := adapter.callHealthCheckGaiaService(authToken)
		if err != nil {
			authToken.GaiaHealth = "Gaia health check not good"
		} else {
			authToken.GaiaHealth = gaiaHealth
		}
	}

	if authToken.BossType == enums.ClientConnected {
		return authToken, nil
	} else {
		return response_dtos.AuthTokenResponseDTO{}, nil
	}
}

func (adapter *AuthAdapter) callSigninAuthService(input model.SigninInput) (response_dtos.AuthTokenResponseDTO, error) {
	authServiceURL := base.AuthServiceURL + "/auth/sign-in"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(authServiceURL, "POST", input, headers)
	if err != nil {
		return response_dtos.AuthTokenResponseDTO{}, err
	}
	bodyMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return response_dtos.AuthTokenResponseDTO{}, err
	}
	dataBytes, err := utils.ConvertResponseToMap(bodyMap["message"])
	if err != nil {
		return response_dtos.AuthTokenResponseDTO{}, err
	}

	var authToken response_dtos.AuthTokenResponseDTO
	err = json.Unmarshal(dataBytes, &authToken)
	if err != nil {
		return response_dtos.AuthTokenResponseDTO{}, err
	}
	return authToken, nil
}

func (adapter *AuthAdapter) callHealthCheckGaiaService(model response_dtos.AuthTokenResponseDTO) (string, error) {
	gaiaServiceURL := base.GaiaServiceURL + "/middleware/health-check"
	headers := utils.BuildDefaultHeaders()

	bodyResult, err := utils.BaseAPI(gaiaServiceURL, "GET", model, headers)
	if err != nil {
		return "Cannot call the API", err
	}

	bodyResultStr, ok := bodyResult.(string)
	if !ok {
		return "Cannot convert the response to string", err
	}

	return bodyResultStr, nil
}

func (adapter *AuthAdapter) GaiaAutoSignin(input model.SigninInput) (response_dtos.AuthTokenResponseDTO, error) {
	authServiceURL := base.AuthServiceURL + "/auth/gaia-auto-sign-in"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(authServiceURL, "POST", input, headers)
	if err != nil {
		return response_dtos.AuthTokenResponseDTO{}, err
	}
	bodyMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return response_dtos.AuthTokenResponseDTO{}, err
	}
	dataBytes, err := utils.ConvertResponseToMap(bodyMap["message"])
	if err != nil {
		return response_dtos.AuthTokenResponseDTO{}, err
	}
	var authToken response_dtos.AuthTokenResponseDTO
	err = json.Unmarshal(dataBytes, &authToken)
	if err != nil {
		return response_dtos.AuthTokenResponseDTO{}, err
	}

	if authToken.BossType == enums.GaiaConnected {
		return authToken, nil
	} else {
		return response_dtos.AuthTokenResponseDTO{}, nil
	}
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

func (adapter *AuthAdapter) GetServiceJWT(serviceName, userId string) (string, error) {
	body := map[string]interface{} {
		"service": serviceName,
		"userId": utils.ParseFloatValue(userId),
	}
	authServiceURL := base.AuthServiceURL + "/auth/get-service-jwt"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(authServiceURL, "POST", body, headers)
	if err != nil {
		return "", err
	}

	bodyMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return "", err
	}

	jwtResponse, ok := bodyMap["message"].(string)
	if !ok {
		return "", err
	}

	return jwtResponse, nil
}