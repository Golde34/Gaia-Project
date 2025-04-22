package services

import (
	request_dtos "chat_hub/core/domain/dtos/request"
	"chat_hub/infrastructure/client"
	"log"
)

type ChatService struct {}

func NewChatService() *ChatService {
	return &ChatService{}
}

func (s *ChatService) HandleChatMessage(userId string, message string) (string, error) {
	log.Println("Message received from user " + userId + ": " + message)
	userModel, err := client.NewAuthAdapter().GetUserLLMModelConfig(userId)
	log.Println("User model config: ", userModel)
	if err != nil {
		log.Println("Error getting user model config: " + err.Error())
		return "", err
	}
	if userModel.ModelName == "" {
		log.Println("User model name is empty, using default model")
		userModel.ModelName = "gemini-2.0-flash"
	}
	var input request_dtos.LLMQueryRequestDTO
	input.UserId = userId
	input.ModelName = userModel.ModelName
	input.Query= message
	chatResponse, err := client.NewLLMCoreAdapter().UserPrompt(input)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return "", err
	}
	return chatResponse, nil	
}