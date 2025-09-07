package consumer

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"notify_agent/core/domain/constants"
	base_dtos "notify_agent/core/domain/dtos/base"
	"notify_agent/core/port/mapper"
	"notify_agent/core/usecase"
)

type OptimizeTaskNotifyHandler struct {
	db *sql.DB
}

func NewOptimizeTaskNotifyHandler(db *sql.DB) *OptimizeTaskNotifyHandler {
	return &OptimizeTaskNotifyHandler{
		db: db,
	}
}

func (handler *OptimizeTaskNotifyHandler) HandleMessage(topic string, key, value []byte) {
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
	case constants.OptimizeTaskCmd:
		OptimizeTaskCmd(key, data, handler.db)
	default:
		log.Println("Message handled successfully, but the cmd does not match to consumer to process")
	}
}

func OptimizeTaskCmd(key []byte, data map[string]interface{}, db *sql.DB) {
	messageId := string(key)
	userId, optimizeStatus, errorStatus, notificationFlowId := mapper.KafkaOptimizeTaskRequestMapper(data)
	if userId == "" || optimizeStatus == "" || errorStatus == "" || notificationFlowId == "" {
		fmt.Println("Error mapping optimize task request")
		return
	}
		
	optimNotify := usecase.NewOptimizeTaskUseCase(db)
	result, err := optimNotify.OptimizeTaskNoti(messageId, userId, optimizeStatus, errorStatus, notificationFlowId)
	if err != nil {
		fmt.Println("Error initializing optimize task")
		return
	}
	fmt.Printf("Optimize task initialized successfully: %v\n", result)

}