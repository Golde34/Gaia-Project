package services

import (
	"chat_hub/infrastructure/client"
	"log"
)

type ChatService struct {}

func NewChatService() *ChatService {
	return &ChatService{}
}

func (s *ChatService) HandleChatMessage(userId string, message string) (string, error) {
	log.Println("Message received from user " + userId + ": " + message)
	chatResponse, err := client.NewLLMCoreAdapter().UserPrompt(userId, message)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return "", err
	}
	return chatResponse, nil	
}