package usecases

import (
	"chat_hub/core/domain/constants"
	request_dtos "chat_hub/core/domain/dtos/request"
	response_dtos "chat_hub/core/domain/dtos/response"
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
	services "chat_hub/core/services/chat"
	redis_cache "chat_hub/infrastructure/cache"
	"chat_hub/infrastructure/client"
	"chat_hub/infrastructure/kafka"
	"chat_hub/kernel/utils"
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"
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

func (s *ChatUsecase) InitiateChat(ctx context.Context, userId string) (string, error) {
	tokenResponse, err := utils.GenerateSSEToken(userId)
	if err != nil {
		return "", err
	}

	err = redis_cache.SetKeyWithTTL(context.Background(), constants.RedisPrefix+constants.SSEToken+userId, tokenResponse, time.Duration(1)*time.Hour)
	if err != nil {
		log.Println("Error setting SSE token in Redis:", err)
		return "", fmt.Errorf("failed to set SSE token: %w", err)
	}
	return tokenResponse, nil
}

func (s *ChatUsecase) HandleChatMessage(userId, dialogueId, message, msgType string) (string, error) {
	log.Printf("Message received from user %s: %s", userId, message)

	dialogue, err := s.getOrCreateDialogue(userId, dialogueId, msgType)
	if err != nil {
		return "", err
	}

	userMessageId, err := s.messageService.CreateMessage(
		dialogue, userId, message, "", enums.UserMessage, msgType)
	if err != nil {
		return "", fmt.Errorf("failed to save user message: %w", err)
	}

	userModel := s.aiCoreService.ValidateUserModel(userId)

	botRequest := request_dtos.NewBotMessageRequestDTO(userId, dialogue.ID, message, msgType, userModel)
	response, err := s.GetBotMessage(*botRequest)
	if err != nil {
		log.Printf("Failed to get bot message: %v", err)
		return "", fmt.Errorf("bot error: %w", err)
	}

	botMessageId, err := s.messageService.CreateMessage(
		dialogue, userId, response, userMessageId, enums.BotMessage, msgType)
	if err != nil {
		return "", fmt.Errorf("failed to save bot response: %w", err)
	}

	log.Printf("Bot message created with ID: %s", botMessageId)
	return response, nil
}

func (s *ChatUsecase) getOrCreateDialogue(userId, dialogueId, msgType string) (entity.UserDialogueEntity, error) {
	if dialogueId != "" {
		dialogue, err := s.dialogueService.GetDialogueById(userId, dialogueId)
		if err != nil {
			return entity.UserDialogueEntity{}, fmt.Errorf("failed to retrieve dialogue: %w", err)
		}
		return dialogue, nil
	}

	dialogue, err := s.dialogueService.CreateDialogueIfNotExists(userId, msgType)
	if err != nil {
		return entity.UserDialogueEntity{}, fmt.Errorf("failed to create dialogue: %w", err)
	}
	return dialogue, nil
}

func (s *ChatUsecase) GetBotMessage(request request_dtos.BotMessageRequestDTO) (string, error) {
	switch request.MessageType {
	case enums.ChatDialogueType:
		log.Println("Handling task optimized for user:", request.UserId)
		botMessage, err := s.aiCoreService.GetBotMessage(request)
		if err != nil {
			return "Error getting bot message: " + err.Error(), err
		}

		go handleChatResponse(botMessage, request.UserId)
		data, exists := botMessage["response"].(string)
		if !exists || data == "" {
			return "Gaia cannot answer this time, system error, just wait.", err
		}

		return data, nil
	case enums.GaiaIntroductionDialogueType:
		chatResponse, err := s.aiCoreService.ChatForOnboarding(request)
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
		chatResponse, err := s.aiCoreService.ChatForRegisterCalendar(request)
		if err != nil {
			log.Println("Error sending message in AIC: " + err.Error())
			return "", err
		}

		go handleRegisterCalendarResponse(chatResponse, request.UserId)
		data, exists := chatResponse["response"].(string)
		if !exists || data == "" {
			return "Internal System Error", err
		}

		return data, nil
	default:
		return "", fmt.Errorf("unknown message type: %s", request.MessageType)
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

	botMessageRequest := request_dtos.NewBotMessageRequestDTO(userId, "", fmt.Sprintf("Task result: %v of userId: %s", taskResult, userId), "Task Result", userModel)
	botMessage, err := s.aiCoreService.GetBotMessage(*botMessageRequest)
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
