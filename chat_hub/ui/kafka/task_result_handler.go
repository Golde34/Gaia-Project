package consumer

import (
	"chat_hub/core/domain/constants"
	base_dtos "chat_hub/core/domain/dtos/base"
	chat_service "chat_hub/core/services/chat"
	websocket_service "chat_hub/core/services/websocket"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/uuid"
)

type TaskResultHandler struct {
	db *sql.DB
}

func NewTaskResultHandler(db *sql.DB) *TaskResultHandler {
	return &TaskResultHandler{
		db: db,
	}
}

func (handler *TaskResultHandler) HandleMessage(topic string, key, value []byte) {
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
	case constants.TaskResultCmd:
		TaskResultCmd(key, data, handler.db)
	default:
		log.Println("Message handled successfully, but the cmd does not match to consumer to process")
	}
}

func TaskResultCmd(key []byte, data map[string]interface{}, db *sql.DB) {
	messageId := string(key)
	log.Println("Processing task result for data:", data)
	userId := data["userId"].(float64)
	userIdStr := fmt.Sprintf("%.0f", userId)
	go handleService(data, userIdStr, db)

	fmt.Printf("Task result handled successfully for message ID: %s\n", messageId)
}

func handleService(messageMap map[string]interface{}, userId string, db *sql.DB) (string, error) {
	result, err := chat_service.NewChatService(db).ResponseTaskResultToUser(messageMap, userId)
	if err != nil {
		log.Println("Error handling task result:", err)
		return "", err
	}

	resultBytes, err := json.Marshal(result)
	if err != nil {
		log.Println("Error marshalling task result message:", err)
		return "", err
	}

	websocket_service.NewWebSocketService(db).SendToUser(userId, []byte(resultBytes), uuid.NewString()) 
	return result.Response, nil;
}