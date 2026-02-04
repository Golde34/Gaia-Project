package client_adapter

import (
	"encoding/json"
	"personal_task_manager/infrastructure/client/base"
	"personal_task_manager/kernel/utils"
	"strconv"
)

type AuthAdapter struct {
	adapter *AuthAdapter
}

func NewAuthAdapter(adapter *AuthAdapter) *AuthAdapter {
	return &AuthAdapter{adapter: adapter}
}

func (adapter *AuthAdapter) CheckExistedUser(userId float64) (interface{}, error) {
	userIdStr := strconv.FormatFloat(userId, 'f', -1, 64)
	authServiceURL := base.AuthServiceURL + "user/get-user-by-id?id=" + userIdStr
	headers := utils.BuildAuthorizationHeaders("authentication_service", userIdStr)
	bodyResult, err := utils.BaseAPI(authServiceURL, "POST", userId, headers)
	if err != nil {
		return nil, err
	}

	bodyResultBytes, err := json.Marshal(bodyResult)
	if err != nil {
		return nil, err
	}

	var result interface{}
	err = json.Unmarshal(bodyResultBytes, &result)
	if err != nil {
		return nil, err
	}
	
	return result, nil
}
