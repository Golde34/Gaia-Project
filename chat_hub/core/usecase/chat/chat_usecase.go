package usecases

import (
	"chat_hub/core/domain/constants"
	request_dtos "chat_hub/core/domain/dtos/request"
	response_dtos "chat_hub/core/domain/dtos/response"
	"chat_hub/core/domain/enums"
	"chat_hub/core/services"
	sse "chat_hub/core/usecase/sse_streaming"
	"chat_hub/infrastructure/client"
	"chat_hub/infrastructure/kafka"
	"chat_hub/kernel/utils"
	"context"
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

/** InitiateChat starts a new chat session for the user and returns a token for SSE streaming.
 * @param ctx - context for the request
 * @param userId - ID of the user initiating the chat
 * @return string - token for SSE streaming
 * @return error - error if any occurs during the process
 */
func (s *ChatUsecase) InitiateChat(ctx context.Context, userId string) (string, error) {
	tokenResponse, err := utils.GenerateSSEToken(userId)
	if err != nil {
		return "", err
	}
	return tokenResponse, nil
}

/**
 * SendChatMessage processes the chat message from the user, interacts with the AI core service,
 * and returns the response to be sent back to the user.
 * @param sseToken - token for SSE streaming
 * @param dialogueId - ID of the dialogue
 * @param message - message sent by the user
 * @param msgType - type of the message (e.g., chat, introduction, etc
 * @return string - response from the AI core service
 * @return error - error if any occurs during the process
 */
func (s *ChatUsecase) SendChatMessage(sseToken, dialogueId, message, msgType string) (string, error) {
	userId, err := utils.DecodeSSEToken(sseToken)
	if err != nil {
		log.Printf("Failed to decode SSE token: %v", err)
		return "", fmt.Errorf("invalid SSE token: %w", err)
	}

	response, err := s.HandleChatMessage(userId, dialogueId, message, msgType)
	if err != nil {
		log.Printf("Error handling chat message: %v", err)
		return "", fmt.Errorf("failed to handle chat message: %w", err)
	}
	
	sse.BroadcastToDialogue(dialogueId, response)

	return response, nil
}

func (s *ChatUsecase) HandleChatMessage(userId, dialogueId, message, msgType string) (string, error) {
	log.Printf("Message received from user %s: %s", userId, message)

	dialogue, err := s.dialogueService.GetOrCreateDialogue(userId, dialogueId, msgType)
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

/** ResponseTaskResultToUser processes the task result and sends it back to the user.
 * @param taskResult - the result of the task to be sent back
 * @param userId - ID of the user to whom the result should be sent
 * @return response_dtos.TaskResultMessageDTO - the formatted response to be sent back to
 * @return error - error if any occurs during the process
 */
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
