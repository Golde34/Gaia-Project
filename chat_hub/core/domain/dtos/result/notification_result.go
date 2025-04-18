package result_dto

import (
	"notify_agent/core/domain/entity"

	"github.com/devfeel/mapper"
)

type NotificationResult struct {
	ID        string `json:"id" bson:"_id"`
	MessageID string `json:"message_id" bson:"message_id"`
	Type      string `json:"type" bson:"type"`
	Content   string `json:"content" bson:"content"`
	Status    string `json:"status" bson:"status"`
}

func NewNotificationResult() *NotificationResult {
	return &NotificationResult{}
}

func (in *NotificationResult) MapperToEntity(input NotificationResult) entity.Notification {
	var out entity.Notification
	mapper.Mapper(&input, &out)
	return out
}
