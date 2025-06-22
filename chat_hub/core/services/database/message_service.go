package services

import (
	request_dtos "chat_hub/core/domain/dtos/request"
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
	"chat_hub/infrastructure/repository"
	"database/sql"
	"fmt"
)

type MessageService struct {
	db *sql.DB

	userRepository *repository.UserMessageRepository
	botRepository *repository.BotMessageRepository
}

func NewMessageService(db *sql.DB) *MessageService {
	return &MessageService{
		db: db,
		userRepository: repository.NewUserMessageRepository(db),
		botRepository: repository.NewBotMessageRepository(db),
	}
}

func (s *MessageService) BuildMessage(dialogue entity.UserDialogueEntity, userId, message, userMessageId string, senderType, messageType string) (request_dtos.MessageRequestDTO) {
	request := request_dtos.MessageRequestDTO {
		UserId:        userId,
		DialogueId:    dialogue.ID,
		UserMessageId: userMessageId, 
		MessageType:   messageType,
		Content:       message,
		Metadata:      "",
		EnumType:      senderType,
	}
	return request
}

func (s *MessageService) CreateMessage(message request_dtos.MessageRequestDTO) (string, error) {
	if message.EnumType == enums.UserMessage {
		return s.userRepository.CreateUserMessage(message)
	}
	if message.EnumType == enums.BotMessage {
		return s.botRepository.CreateBotMessage(message)
	}
	return "", fmt.Errorf("invalid message type: %s", message.EnumType)
}
