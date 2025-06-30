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

func (s *MessageService) GetMessageByDialogueId(dialogueId string, numberOfMessages int) (response_dtos.RecentChatHistory, error) {
	// recentChatHistory := make([]response_dtos.RecentChatMessageDTO, 0)

	// if numberOfMessages <= 0 {
	// 	return response_dtos.RecentChatHistory{}, fmt.Errorf("number of messages must be greater than 0")
	// }

	// userMessages, err := s.userRepository.GetUserMessagesByDialogueId(dialogueId, numberOfMessages)
	// if err != nil {
	// 	log.Println("Error retrieving user messages:", err)
	// 	return response_dtos.RecentChatHistory{}, err
	// }

	// for _, userMessage := range userMessages {
	// 	botMessages, err := s.botRepository.GetBotMessagesByUserMessageId(userMessage.Id)
	// 	if err != nil {
	// 		log.Println("Error retrieving bot messages:", err)
	// 		return response_dtos.RecentChatHistory{}, err
	// 	}

	// 	recentChatHistory = append(recentChatHistory, response_dtos.RecentChatMessageDTO{
	// 		UserMessage: userMessage.Content,
	// 		BotMessages: botMessages,
	// 	})
	// }

	// return response_dtos.RecentChatHistory{
	// 	Messages: recentChatHistory,
	// }, nil

	return response_dtos.RecentChatHistory{}, fmt.Errorf("GetMessageByDialogueId is not implemented yet")
}
