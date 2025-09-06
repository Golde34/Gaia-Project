package services

import client_adapter "middleware_loader/infrastructure/client"

type NotificationService struct {
	adapter *client_adapter.NotificationAdapter
}

func NewNotificationService() *NotificationService {
	return &NotificationService{}
}

func (s *NotificationService) GetAllNotification(userId string) ([]map[string]interface{}, error) {
	notifications, err := s.adapter.GetAllNotifications(userId) 
	if err != nil {
		return []map[string]interface{}{}, err
	}
	return notifications, nil
}
