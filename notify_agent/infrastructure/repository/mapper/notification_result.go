package mapper

import (
	"notify_agent/core/domain/entity"
	"notify_agent/kernel/utils"
)

func MapEntityToResult(row map[string]interface{}) entity.Notification {
		return entity.Notification{
		ID: utils.ToStringUUID(row["id"]),
		MessageID: row["message_id"].(string),
		Type: row["type"].(string),
		Content: row["content"].(string),
		ReceiverID: row["receiver_id"].(string),
		IsRead: row["is_read"].(bool),
		Status: row["status"].(string),
		ErrorStatus: row["error_status"].(string),
		UserId: row["user_id"].(string),
		NotificationFlowId: row["notification_flow_id"].(string),
	}
}