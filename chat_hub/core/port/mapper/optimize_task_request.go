package mapper

import (
	"fmt"
	request_dtos "chat_hub/core/domain/dtos/request"
	"chat_hub/core/domain/entity"
	"time"
)

func KafkaOptimizeTaskRequestMapper(data map[string]interface{}) (string, string, string, string){
	userId, ok := data["userId"].(float64)
	if !ok {
		fmt.Println("Error casting userId")
		return "", "", "", ""
	}
	optimizeStatus, ok := data["optimizeStatus"].(string)
	if !ok {
		fmt.Println("Error casting optimizeStatus")
		return "", "", "", ""
	}
	errorStatus, ok := data["errorStatus"].(string)
	if !ok {
		fmt.Println("Error casting errorStatus")
		return "", "", "", ""
	}
	notificationFlowId, ok := data["notificationFlowId"].(string)
	if !ok {
		fmt.Println("Error casting notificationFlowId")
		return "", "", "", ""
	}
	userIdStr := fmt.Sprintf("%d", int(userId))
	return userIdStr, optimizeStatus, errorStatus, notificationFlowId 
}

func InsertOptimizeTaskRequestMapper(messageId, userId, optimizeStatus, errorStatus, notificationFlowId string) request_dtos.InsertNotificationRequestDTO {
	var input request_dtos.InsertNotificationRequestDTO
	input.UserId = userId
	input.Status = optimizeStatus
	input.ErrorStatus = errorStatus 
	input.Content = errorStatus + " Optimize Task " + optimizeStatus
	input.Type = "OPTIMIZE"
	input.IsRead = false
	input.MessageID = messageId
	input.NotificationFlowId = notificationFlowId
	return input
}

func UpdateOptimizeTaskRequestMapper(messageId, optimizeStatus, errorStatus string, notification entity.Notification) entity.Notification {
	notification.Status = optimizeStatus
	notification.ErrorStatus = errorStatus
	notification.Content = "Optimize Task " + optimizeStatus
	notification.IsRead = false
	notification.MessageID = messageId
	notification.UpdatedAt = time.Now().Unix()
	return notification
}