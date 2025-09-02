package consumer

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"notify_agent/core/domain/constants"
	base_dtos "notify_agent/core/domain/dtos/base"
)

type TaskResultHandler struct{
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
	// go handleService(data, userIdStr, db)
	fmt.Printf("Task result command received for user ID: %s\n", userIdStr)
	fmt.Printf("Task result handled successfully for message ID: %s\n", messageId)
}