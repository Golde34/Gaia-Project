package services

import (
	request_dtos "chat_hub/core/domain/dtos/request"
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
	"chat_hub/infrastructure/repository"
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"time"
)

type MessageService struct {
	db *sql.DB

	userRepository *repository.UserMessageRepository
	botRepository  *repository.BotMessageRepository
}

func NewMessageService(db *sql.DB) *MessageService {
	return &MessageService{
		db:             db,
		userRepository: repository.NewUserMessageRepository(db),
		botRepository:  repository.NewBotMessageRepository(db),
	}
}

func (s *MessageService) CreateMessage(dialogue entity.UserDialogueEntity, userId, message, userMessageId string, senderType, messageType string) (string, error) {
	messageRequest := s.buildMessage(dialogue, userId, message, userMessageId, senderType, messageType)
	messageId, err := s.createMessageToDB(messageRequest)
	if err != nil {
		log.Println("Error creating message: " + err.Error())
		return "", err
	}
	log.Println("Message created with ID: " + messageId)
	return messageId, nil
}

func (s *MessageService) buildMessage(dialogue entity.UserDialogueEntity, userId, message, userMessageId string, senderType, messageType string) request_dtos.MessageRequestDTO {
	userIdF, err := strconv.ParseInt(userId, 10, 64)
	if err != nil {
		return request_dtos.MessageRequestDTO{} 
	}
	request := request_dtos.MessageRequestDTO{
		UserId:        userIdF,
		DialogueId:    dialogue.ID,
		UserMessageId: userMessageId,
		MessageType:   messageType,
		Content:       message,
		Metadata:      "",
		EnumType:      senderType,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	return request
}

func (s *MessageService) createMessageToDB(message request_dtos.MessageRequestDTO) (string, error) {
	if message.EnumType == enums.UserMessage {
		return s.userRepository.CreateUserMessage(message)
	}
	if message.EnumType == enums.BotMessage {
		return s.botRepository.CreateBotMessage(message)
	}
	return "", fmt.Errorf("invalid message type: %s", message.EnumType)
}
