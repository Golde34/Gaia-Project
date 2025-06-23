package usecases

import (
	"chat_hub/core/domain/constants"
	response_dtos "chat_hub/core/domain/dtos/response"
	"chat_hub/core/domain/enums"
	services "chat_hub/core/services/chat"
	"chat_hub/infrastructure/client"
	"chat_hub/infrastructure/kafka"
	"database/sql"
	"fmt"
	"log"
)

type ChatUsecase struct {
	db *sql.DB

	authClient    *client.AuthAdapter
	aiCoreService *services.AICoreService

	dialogueService *services.DialogueService
	messageService  *services.MessageService
}

func NewChatUsecase(db *sql.DB) *ChatUsecase {
	return &ChatUsecase{
		db: db,

		authClient:    client.NewAuthAdapter(),
		aiCoreService: services.NewAICoreService(),

		dialogueService: services.NewDialogueService(db),
		messageService:  services.NewMessageService(db),
	}
}

func (s *ChatUsecase) HandleChatMessage(userId, message, msgType string) (string, error) {
	log.Println("Message received from user " + userId + ": " + message)
	dialogue, err := s.dialogueService.CreateDialogueIfNotExists(userId, msgType)
	if err != nil {
		return "Error creating dialogue: " + err.Error(), err
	}
	userMessageId, err := s.messageService.CreateMessage(
		dialogue, userId, message, "", enums.UserMessage, msgType)
	if err != nil {
		return "Error creating user message: " + err.Error(), err
	}
	userModel := s.aiCoreService.ValidateUserModel(userId)

	data, err := s.GetBotMessage(userId, message, msgType, userModel)
	if err != nil {
		log.Println("Error getting bot message: " + err.Error())
		return "Error getting bot message: " + err.Error(), err
	}

	botMessageId, err := s.messageService.CreateMessage(
		dialogue, userId, data, userMessageId, enums.BotMessage, msgType)
	if err != nil {
		return "Error crating bot message in DB: " + err.Error(), err
	}
	log.Println("Bot message created with ID: " + botMessageId)

	return data, nil
}

func (s *ChatUsecase) GetBotMessage(userId, message, msgType, userModel string) (string, error) {
	switch msgType {
	case enums.ChatDialogueType:
		log.Println("Handling task optimized for user:", userId)
		botMessage, err := s.aiCoreService.GetBotMessage(userId, message, userModel)
		if err != nil {
			return "Error getting bot message: " + err.Error(), err
		}

		go handleChatResponse(botMessage, userId)
		data, exists := botMessage["response"].(string)
		if !exists || data == "" {
			return "Gaia cannot answer this time, system error, just wait.", err
		}

		return data, nil
	case enums.GaiaIntroductionDialogueType:
		chatResponse, err := s.aiCoreService.ChatForOnboarding(userId, message, msgType)
		if err != nil {
			log.Println("Error sending message in AIC: " + err.Error())
			return "", err
		}

		data, exists := chatResponse["response"].(string)
		if !exists || data == "" {
			return "Internal System Error", err
		}

		return data, nil
	case enums.RegisterCalendarDialogueType:
		chatResponse, err := s.aiCoreService.ChatForRegisterCalendar(userId, message, msgType)
		if err != nil {
			log.Println("Error sending message in AIC: " + err.Error())
			return "", err
		}

		go handleRegisterCalendarResponse(chatResponse, userId)
		data, exists := chatResponse["response"].(string)
		if !exists || data == "" {
			return "Internal System Error", err
		}

		return data, nil
	default:
		return "", fmt.Errorf("unknown message type: %s", msgType)
	}
}

func handleChatResponse(chatResponse map[string]interface{}, userId string) {
	log.Println("Handling chat response for user " + userId)
	if chatResponse["type"] == "chitchat" {
		log.Println("Chitchat response for user " + userId)
	}

	if chatResponse["type"] == "create_task" {
		log.Println("Create task response for user " + userId)
		chatResponse["task"].(map[string]interface{})["userId"] = userId
		if chatResponse["task"].(map[string]interface{})["actionType"] == "create" {
			kafka.ProduceKafkaMessage(chatResponse["task"].(map[string]interface{}), constants.AICreateTaskTopic, constants.CreateTaskCmd)
		}
	}
}

func handleRegisterCalendarResponse(chatResponse map[string]interface{}, userId string) {
	log.Println("Handling chat response for user " + userId)
	if chatResponse["type"] == "chitchat" {
		log.Println("Chitchat response for user " + userId)
	}

	if chatResponse["type"] == "register_calendar" {
		log.Println("Register calendar response for user " + userId)
		chatResponse["task"].(map[string]interface{})["userId"] = userId
		// kafka.ProduceKafkaMessage(chatResponse["task"].(map[string]interface{}), constants.AIRegisterCalendarTopic, constants.RegisterCalendarCmd)
	}
} 

func (s *ChatUsecase) ResponseTaskResultToUser(taskResult map[string]interface{}, userId string) (response_dtos.TaskResultMessageDTO, error) {
	log.Printf("Message received from user %s: %v", userId, taskResult)
	userModel := s.aiCoreService.ValidateUserModel(userId)
	botMessage, err := s.aiCoreService.GetBotMessage(userId, fmt.Sprintf("Task result: %v of userId: %s", taskResult, userId), userModel)
	if err != nil {
		log.Println("Error getting bot message: " + err.Error())
		return response_dtos.TaskResultMessageDTO{}, err
	}

	var data response_dtos.TaskResultMessageDTO
	data.Type = "taskResult"
	data.Response = botMessage["response"].(string)
	data.TaskResult = botMessage["task"].(map[string]interface{})

	return data, nil
}
