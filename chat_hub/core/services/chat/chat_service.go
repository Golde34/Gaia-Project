package services

type ChatService struct {}

func NewChatService() *ChatService {
	return &ChatService{}
}

func (s *ChatService) HandleChatMessage(userId string, message string) (string, error) {
	response := "Message received from user " + userId + ": " + message
	return response, nil	
}