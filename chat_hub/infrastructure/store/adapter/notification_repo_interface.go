package store_adapter

import (
	"context"
	"chat_hub/core/domain/entity"
)

type INotificationRepository interface {
	CreateNotification(context context.Context, notification entity.Notification) (interface{}, error)
	GetNotificationByNotificationFLowId(context context.Context, notificationStringId string) (entity.Notification, error)
	UpdateNotification(context context.Context, notificationId string, notification entity.Notification) (entity.Notification, error)
}