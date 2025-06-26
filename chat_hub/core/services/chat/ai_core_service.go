package services

import (
	request_dtos "chat_hub/core/domain/dtos/request"
	"chat_hub/infrastructure/client"
	"log"
)

type AICoreService struct {
	authClient *client.AuthAdapter
	aiClient *client.LLMCoreAdapter
}

func NewAICoreService() *AICoreService {
	return &AICoreService{
		authClient: client.NewAuthAdapter(),
		aiClient: client.NewLLMCoreAdapter(),
	}
}

func (s *AICoreService) ValidateUserModel(userId string) string {
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

func (s *AICoreService) GetBotMessage(request request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	chatResponse, err := s.aiClient.ChatForTask(request)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return nil, err
	}

	return chatResponse, nil
}

func (s *AICoreService) ChatForOnboarding(request request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) {
	chatResponse, err := s.aiClient.ChatForOnboarding(request)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return nil, err
	}
	return chatResponse, nil
}

func (s *AICoreService) ChatForRegisterCalendar(request request_dtos.BotMessageRequestDTO) (map[string]interface{}, error) { 
	chatResponse, err := s.aiClient.ChatForRegisterCalendar(request)
	if err != nil {
		log.Println("Error sending message to LLMCoreAdapter: " + err.Error())
		return nil, err
	}

	return chatResponse, nil
}