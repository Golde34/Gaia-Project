package consumer

import (
	"encoding/json"
	"fmt"
	"log"
	"notify_agent/core/domain/constants"
	base_dtos "notify_agent/core/domain/dtos/base"
	"notify_agent/core/domain/enums"
	websocket_service "notify_agent/core/services/websocket"
)

type ScheduleResultHandler struct {
	websocketUsecase *websocket_service.WebSocketService
}

func NewScheduleResultHandler() *ScheduleResultHandler {
	return &ScheduleResultHandler{
		websocketUsecase: websocket_service.NewWebSocketService(),
	}
}

func (handler *ScheduleResultHandler) HandleMessage(topic string, key, value []byte) {
	fmt.Printf("Handling message for topic %s: %s\n", topic, string(value))

	var message base_dtos.KafkaMessage
	if err := json.Unmarshal(value, &message); err != nil {
		fmt.Printf("Error unmarshalling message: %s\n", err)
		return
	}

	data, ok := message.Data.(map[string]interface{})
	if !ok {
		fmt.Println("Error casting message data")
		return
	}

	switch message.Cmd {
	case constants.GenerateCalendarScheduleCmd:
		handler.RegisterCalendarTopic(key, data)
	case constants.GenerateTaskResultCmd:
		handler.HandlerGenerateTaskResult(key, data)
	default:
		log.Println("Message handled successfully, but the cmd does not match to consumer to process")
	}
}

func (handler *ScheduleResultHandler) RegisterCalendarTopic(key []byte, data map[string]interface{}) {
	messageId := string(key)
	log.Println("Processing Register Calendar for data:", data)
	userId := data["userId"].(float64)
	go handler.handleService(data, userId, enums.RegisterCalendarDialogueType )

	fmt.Printf("Register Calendar handled successfully for message ID: %s\n", messageId)
}

func (handler *ScheduleResultHandler) HandlerGenerateTaskResult(key []byte, data map[string]interface{}) {
	messageId := string(key)
	log.Println("Processing Generate Task Result for data:", data)
	response := data["response"].(string)
	task := data["task"].(map[string]interface{})
	userId := task["userId"].(float64)
	data = map[string]interface{}{
		"response": response,
		"task": task,
		"dialogueId": data["dialogueId"],
		"operationStatus": data["operationStatus"],
	}
	go handler.handleService(data, userId, enums.GenerateTaskResultDialogueType )	

	fmt.Printf("Generate Task Result handled successfully for message ID: %s\n", messageId)
}

func (handler *ScheduleResultHandler) handleService(messageMap map[string]interface{}, userId float64, messageType string) {
	userIdStr := fmt.Sprintf("%.0f", userId)
	// return messageMap to client
	response := map[string]interface{}{
		"type": messageType,
		"userId": userIdStr,
		"data": messageMap,
	}

	messageMapStr, err := json.Marshal(response)
	if err != nil {
		log.Println("Error marshaling messageMap:", err)
		return
	}

	log.Println("Handling service for user:", messageMapStr)
	handler.websocketUsecase.SendToUser(userIdStr, messageMapStr)
}
