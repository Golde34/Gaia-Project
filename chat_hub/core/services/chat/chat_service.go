package services

import (
	"chat_hub/core/domain/constants"
	request_dtos "chat_hub/core/domain/dtos/request"
	response_dtos "chat_hub/core/domain/dtos/response"
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
	services "chat_hub/core/services/database"
	"chat_hub/infrastructure/client"
	"chat_hub/infrastructure/kafka"
	"database/sql"
	"fmt"
	"log"
)

type ChatService struct {
	db *sql.DB

	authClient *client.AuthAdapter
	aiCoreClient *client.LLMCoreAdapter

	dialogueService *services.DialogueService
	messageService *services.MessageService
}

func NewChatService(db *sql.DB) *ChatService {
	return &ChatService{
		db: db,

		authClient: client.NewAuthAdapter(),
		aiCoreClient: client.NewLLMCoreAdapter(),

		dialogueService: services.NewDialogueService(db),
		messageService: services.NewMessageService(db),
	}
}

func (s *ChatService) HandleChatMessage(userId, message string) (string, error) {
	log.Println("Message received from user " + userId + ": " + message)
	dialogue, err := s.dialogueService.CreateDialogueIfNotExists(userId, enums.ChatDialogueType) 
	if err != nil {
		log.Println("Error creating dialogue: " + err.Error())
		return "Gaia cannot answer this time, system error, just wait.", err
	}
	userMessageId, err := s.createMessage(dialogue, userId, message, "", enums.UserMessage, enums.ChatDialogueType)
	if err != nil {
		log.Println("Error creating user message: " + err.Error())
		return "Gaia cannot answer this time, system error, just wait.", err
	}	
	userModel := s.validateUserModel(userId)
	botMessage, err := s.getBotMessage(userId, message, userModel)
	if err != nil {
		log.Println("Error getting bot message: " + err.Error())
		return "Gaia cannot answer this time, system error, just wait.", err
	}

	go handleChatResponse(botMessage, userId)
	data, exists := botMessage["response"].(string)
	if !exists || data == "" {
		return "Internal System Error", err
	}

	botMessageId, err := s.createMessage(dialogue, userId, data, userMessageId, enums.BotMessage, enums.ChatDialogueType)
	if err != nil {
		log.Println("Error creating bot message: " + err.Error())
		return "Gaia cannot answer this time, system error, just wait.", err
	}
	log.Println("Bot message created with ID: " + botMessageId)

	return data, nil
}

func (s *ChatService) createMessage(dialogue entity.UserDialogueEntity, userId, message, userMessageId string, senderType, messageType string) (string, error) {
	messageRequest := s.messageService.BuildMessage(dialogue, userId, message, userMessageId, senderType, messageType)
	messageId, err := s.messageService.CreateMessage(messageRequest)
	if err != nil {
		log.Println("Error creating message: " + err.Error())
		return "", err
	}
	log.Println("Message created with ID: " + messageId)
	return messageId, nil
}

func (s *ChatService) validateUserModel(userId string) (string) {
	log.Println("Validating user model for user " + userId)
	userModel, err := s.authClient.GetUserLLMModelConfig(userId)
	defaultModel := "gemini-2.0-flash"
	if err != nil {
		log.Println("Error getting user model config: " + err.Error())
		return defaultModel
	}
	if userModel.ModelName == "" {
		log.Println("User model name is empty, using default model")
		return defaultModel
	}
	return userModel.ModelName
}

func (s *ChatService) getBotMessage(userId, message, model string) (map[string]interface{}, error) {
	var input request_dtos.LLMQueryRequestDTO
	input.UserId = userId
	input.ModelName = model 
	input.Query = message
	chatResponse, err := s.aiCoreClient.ChatForTask(input)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return nil, err
	}

	return chatResponse, nil
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

func (s *ChatService) ResponseTaskResultToUser(taskResult map[string]interface{}, userId string) (response_dtos.TaskResultMessageDTO, error) {
	log.Printf("Message received from user %s: %v", userId, taskResult)
	userModel := s.validateUserModel(userId)	
	botMessage, err := s.getBotMessage(userId, fmt.Sprintf("Task result: %v of userId: %s", taskResult, userId), userModel)
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

func (s *ChatService) HandleGaiaIntroductionMessage(userId, message, msgType string) (string, error) {
	log.Println("Message received from user " + userId + ": " + message)
	
	// dialogue, err := s.dialogueService.CreateDialogueIfNotExists(userId, msgType) 

	var input request_dtos.LLMSystemQueryRequestDTO
	input.Query = message
	input.Type = msgType
	chatResponse, err := client.NewLLMCoreAdapter().ChatForOnboarding(input)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return "", err
	}

	go handleGaiaIntroductionResponse(chatResponse, userId)

	data, exists := chatResponse["response"].(string)
	if !exists || data == "" {
		return "Internal System Error", err
	}

	return data, nil
}

func handleGaiaIntroductionResponse(chatResponse map[string]interface{}, userId string) {
	log.Println("Handling chat response for user " + userId)
	if chatResponse["type"] == "chitchat" {
		log.Println("Chitchat response for user " + userId)
	}
}
