package services

import (
	response_dtos "chat_hub/core/domain/dtos/response"
	entity "chat_hub/core/domain/entities"
	"chat_hub/infrastructure/repository"
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"time"
)

type MessageService struct {
	db *sql.DB

	messageRepository *repository.MessageRepository
}

func NewMessageService(db *sql.DB) *MessageService {
	return &MessageService{
		db:                db,
		messageRepository: repository.NewMessageRepository(db),
	}
}

func (s *MessageService) CreateMessage(dialogue entity.UserDialogueEntity, userId, message, userMessageId string, senderType, messageType string) (string, error) {
	messageRequest, err := s.buildMessage(dialogue, userId, message, userMessageId, senderType, messageType)
	if err != nil {
		log.Println("Error building message: " + err.Error())
		return "", err
	}
	messageId, err := s.messageRepository.CreateMessage(messageRequest)
	if err != nil {
		log.Println("Error creating message: " + err.Error())
		return "", err
	}
	log.Println("Message created with ID: " + messageId)
	return messageId, nil
}

func (s *MessageService) buildMessage(dialogue entity.UserDialogueEntity, userId, message, userMessageId string, senderType, messageType string) (entity.MessageEntity, error) {
	userIdF, err := strconv.ParseInt(userId, 10, 64)
	if err != nil {
		return entity.MessageEntity{}, fmt.Errorf("invalid user ID: %v", err)
	}
	entity := entity.MessageEntity{
		UserId:        userIdF,
		DialogueId:    dialogue.ID,
		UserMessageId: userMessageId,
		MessageType:   messageType,
		Content:       message,
		Metadata:      "",
		SenderType:    senderType,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	return entity, nil
}

func (s *MessageService) GetMessageByDialogueId(dialogueId string, numberOfMessages int) (response_dtos.RecentHistory, error) {
	recentChatMessages, err := s.messageRepository.GetRecentChatMessagesByDialogueId(dialogueId, numberOfMessages)
	if err != nil {
		log.Println("Error getting recent chat messages: " + err.Error())
		return response_dtos.RecentHistory{}, err
	}
	if len(recentChatMessages) == 0 {
		log.Println("No messages found for dialogue ID: " + dialogueId)
		return response_dtos.RecentHistory{}, nil
	}
	var recentChatMessagesDTO []response_dtos.MessageResponseDTO
	for _, message := range recentChatMessages {
		recentChatMessagesDTO = append(recentChatMessagesDTO, response_dtos.MessageResponseDTO{
			Message:    "<" + message.SenderType + "> " + message.Content,
			Metadata:   message.Metadata,
		})
	}

	var recentChatHistoryDTO response_dtos.RecentHistory
	recentChatHistoryDTO.UserId = recentChatMessages[0].UserId
	recentChatHistoryDTO.DialogueId = recentChatMessages[0].DialogueId
	recentChatHistoryDTO.Messages = recentChatMessagesDTO

	return recentChatHistoryDTO, nil
}

func (s *MessageService) GetMessageByPagination(dialogueId string, size int, cursor string) ([]entity.MessageEntity, error) {
	messages, err := s.messageRepository.GetMessagesByDialogueIdWithCursorPagination(dialogueId, size, cursor)
	if err != nil {
		log.Println("Error getting messages by pagination: " + err.Error())
		return nil, err
	}
	if len(messages) == 0 {
		log.Println("No messages found for dialogue ID: " + dialogueId)
		return nil, nil
	}
	return messages, nil
}