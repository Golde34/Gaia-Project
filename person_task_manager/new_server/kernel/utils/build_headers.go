package utils

import (
	"fmt"
	"personal_task_manager/infrastructure/security"
	"personal_task_manager/kernel/configs"
	"strings"
)

var config = configs.SecurityConfig{}
var securityConfig, _ = config.LoadSecurityEnv()
var privateToken = securityConfig.PrivateToken

func BuildDefaultHeaders() map[string]string {
	headers := make(map[string]string)
	headers["Content-Type"] = "application/json"
	headers["Accept"] = "application/json"
	return headers
}

func BuildAuthorizationHeaders(service string, userId string) map[string]string {
	headers := BuildDefaultHeaders()
	headers["Service"] = service
	token, err := security.EncryptWithKeyPair(service + "::" + privateToken + "::" + userId)
	if err != nil {
		fmt.Println("Error encrypting token: ", err)
		return headers
	}
	headers["Service-Token"] = token
	return headers
}

func GenerateSSEToken(userId string) (string, error) {
	service := "chat_hub"
	token, err := security.EncryptSSE(service + "::" + privateToken + "::" + userId)
	if err != nil {
		return "", fmt.Errorf("failed to generate SSE token: %w", err)
	}
	return token, nil
}

func DecodeSSEToken(token string) (string, error) {
	decoded, err := security.DecryptSSE(token)
	if err != nil {
		return "", fmt.Errorf("failed to decode SSE token: %w", err)
	}

	parts := strings.Split(decoded, "::")
	if len(parts) < 3 {
		return "", fmt.Errorf("invalid SSE token format")
	}
	if parts[0] != "chat_hub" {
		return "", fmt.Errorf("invalid service in SSE token")
	}
	if parts[1] != privateToken {
		return "", fmt.Errorf("invalid private token in SSE token")
	}
	userId := parts[2]
	if userId == "" {
		return "", fmt.Errorf("userId not found in SSE token")
	}
	return userId, nil
}
