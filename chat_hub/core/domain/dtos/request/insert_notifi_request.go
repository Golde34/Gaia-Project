package request_dtos

import (
	"chat_hub/core/domain/entity"
	"time"

	"github.com/google/uuid"
)

type InsertNotificationRequestDTO struct {
	MessageID          string `json:"message_id"`
	Type               string `json:"type"`
	Content            string `json:"content"`
	Status             string `json:"status"`
	ErrorStatus        string `json:"error_status"`
	IsRead             bool   `json:"is_read"`
	UserId             string `json:"user_id"`
	NotificationFlowId string `json:"notification_flow_id"`
}

func NewInsertNotificationRequestDTO() *InsertNotificationRequestDTO {
	return &InsertNotificationRequestDTO{}
}

func (r *InsertNotificationRequestDTO) MapToEntity(request InsertNotificationRequestDTO) entity.Notification {
	return entity.Notification{
		ID:                 uuid.NewString(),
		MessageID:          request.MessageID,
		Type:               request.Type,
		Content:            request.Content,
		Status:             request.Status,
		ErrorStatus:        request.ErrorStatus,
		IsRead:             request.IsRead,
		UserId:             request.UserId,
		NotificationFlowId: request.NotificationFlowId,
		CreatedAt:          time.Now().Unix(),
		UpdatedAt:          time.Now().Unix(),
	}
}
