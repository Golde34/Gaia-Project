package client

import (
	"fmt"
	"notify_agent/infrastructure/client/base"
	"notify_agent/kernel/utils"
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
		"jwt":         jwt,
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
