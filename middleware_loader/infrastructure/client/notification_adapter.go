package client_adapter

import (
	"fmt"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type NotificationAdapter struct {}

func NewNotificationAdapter() *NotificationAdapter {
	return &NotificationAdapter{}
}

func (adapter *NotificationAdapter) GetAllNotifications(userId string) ([]map[string]interface{}, error) {
	listAllNotificationsURL := base.NotifyAgentURL+ "/notification/all/" + userId
	headers := utils.BuildDefaultHeaders()
	notifications, err := utils.BaseAPI(listAllNotificationsURL, "GET", nil, headers)
	if err != nil {
		return []map[string]interface{}{}, err
	}
	typedNotifications, ok := notifications.([]map[string]interface{})
	if !ok {
		return []map[string]interface{}{}, fmt.Errorf("failed to assert notifications type")
	}
	return typedNotifications, nil
}