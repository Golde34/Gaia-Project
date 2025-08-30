package consumer

import (
	"chat_hub/core/domain/constants"
	base_dtos "chat_hub/core/domain/dtos/base"
	"chat_hub/core/domain/enums"
	"chat_hub/core/services"
	chat_usecases "chat_hub/core/usecase/chat"
	ws_usecases "chat_hub/core/usecase/websocket"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
)

type ScheduleResultHandler struct {
	db *sql.DB

	chatUsecase      *chat_usecases.ChatUsecase
	websocketUsecase *ws_usecases.WebSocketUsecase

	schedulePlanService *services.SchedulePlanService
}

func NewScheduleResultHandler(db *sql.DB) *ScheduleResultHandler {
	return &ScheduleResultHandler{
		db: db,

		chatUsecase:      chat_usecases.NewChatUsecase(db),
		websocketUsecase: ws_usecases.NewWebSocketUsecase(db),

		schedulePlanService: services.NewSchedulePlanService(),
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
	case constants.RegisterCalendarCmd:
		handler.RegisterCalendarTopic(key, data)
	default:
		log.Println("Message handled successfully, but the cmd does not match to consumer to process")
	}
}

func (handler *ScheduleResultHandler) RegisterCalendarTopic(key []byte, data map[string]interface{}) {
	messageId := string(key)
	log.Println("Processing Register Calendar for data:", data)
	userId := data["userId"].(string)
	go handler.handleService(data, userId)

	fmt.Printf("Register Calendar handled successfully for message ID: %s\n", messageId)
}

func (handler *ScheduleResultHandler) handleService(messageMap map[string]interface{}, userId string) {
	// return messageMap to client
	response := map[string]interface{}{
		"type": enums.RegisterCalendarDialogueType,
		"userId": userId,
		"data": messageMap,
	}

	messageMapStr, err := json.Marshal(response)
	if err != nil {
		log.Println("Error marshaling messageMap:", err)
		return
	}

	response, err = handler.schedulePlanService.ReturnTimeBubbleConfig(userId, messageMap)
	if err != nil {
		log.Println("Error getting time bubble config:", err)
		return
	}

	log.Println("Handling service for user:", messageMapStr)
	handler.websocketUsecase.SendToUserWithNoSession(userId, messageMapStr)
}
