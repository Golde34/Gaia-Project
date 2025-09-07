package client_adapter

import (
	"encoding/json"
	"fmt"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type NotificationAdapter struct{}

func NewNotificationAdapter() *NotificationAdapter {
	return &NotificationAdapter{}
}

func (adapter *NotificationAdapter) GetAllNotifications(userId string) ([]map[string]interface{}, error) {
	listAllNotificationsURL := base.NotifyAgentURL + "/notification/all/" + userId
	headers := utils.BuildDefaultHeaders()
	notifications, err := utils.BaseAPI(listAllNotificationsURL, "GET", nil, headers)
	if err != nil {
		return []map[string]interface{}{}, err
	}
	data, err := json.Marshal(notifications)
	if err != nil {
		return []map[string]interface{}{}, fmt.Errorf("failed to assert notifications type")
	}
	var out []map[string]interface{}
	if err := json.Unmarshal(data, &out); err != nil {
		return nil, fmt.Errorf("decode notifications failed: %w", err)
	}

	return out, nil
}
