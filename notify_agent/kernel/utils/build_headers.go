package utils

import (
	"fmt"
	"notify_agent/infrastructure/security"
	"notify_agent/kernel/configs"
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
	token, err := security.Encrypt(service + "::" + privateToken + "::" + userId)
	if err != nil {
		fmt.Println("Error encrypting token: ", err)
		return headers
	}
	headers["Service-Token"] = token
	return headers
}