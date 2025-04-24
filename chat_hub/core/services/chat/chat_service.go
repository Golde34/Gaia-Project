package services

import (
	"chat_hub/core/domain/constants"
	request_dtos "chat_hub/core/domain/dtos/request"
	"chat_hub/infrastructure/client"
	"chat_hub/infrastructure/kafka"
	"fmt"
	"log"
)

type ChatService struct{}

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
	input.Query = message
	chatResponse, err := client.NewLLMCoreAdapter().UserPrompt(input)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return "", err
	}

	go handleChatResponse(chatResponse, userId)

	data, exists := chatResponse["response"].(string)
	if !exists || data == "" {
		return "Internal System Error", err
	}

	return data, nil
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

func (s *ChatService) ResponseTaskResultToUser(taskResult map[string]interface{}, userId string) (string, error) {
	log.Printf("Message received from user %s: %v", userId, taskResult)
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
	input.Query = fmt.Sprintf("Task result: %v of userId: %s", taskResult, userId) 
	chatResponse, err := client.NewLLMCoreAdapter().UserPrompt(input)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return "", err
	}

	data, exists := chatResponse["response"].(string)
	if !exists || data == "" {
		return "Internal System Error", err
	}

	return data, nil
}