package consumer

import (
	"chat_hub/core/domain/constants"
	base_dtos "chat_hub/core/domain/dtos/base"
	services "chat_hub/core/services/chat"
	"encoding/json"
	"fmt"
	"log"
)

type TaskResultHandler struct {}

func NewTaskResultHandler() *TaskResultHandler {
	return &TaskResultHandler{}
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
		TaskResultCmd(key, data)
	default:
		log.Println("Message handled successfully, but the cmd does not match to consumer to process")
	}
}

func TaskResultCmd(key []byte, data map[string]interface{}) {
	messageId := string(key)

	userId := data["userId"].(string)
	handleService(data, userId)

	fmt.Printf("Task result handled successfully for message ID: %s\n", messageId)
}

func handleService(messageMap map[string]interface{}, userId string) (string, error) {
	result, err := services.NewChatService().ResponseTaskResultToUser(messageMap, userId)
	if err != nil {
		log.Println("Error handling task result:", err)
		return "", err
	}

	// SendToUser(userId, []byte(result))
	return result, nil;
}