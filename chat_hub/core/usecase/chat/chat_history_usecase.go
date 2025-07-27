package usecases

import (
	entity "chat_hub/core/domain/entities"
	services "chat_hub/core/services/chat"
	"database/sql"
	"time"
)

type ChatHistoryUsecase struct {
	db *sql.DB

	dialogueService *services.DialogueService
	messageService  *services.MessageService
}

func NewChatHistoryUsecase(db *sql.DB) *ChatHistoryUsecase {
	return &ChatHistoryUsecase{
		db: db,

		dialogueService: services.NewDialogueService(db),
		messageService:  services.NewMessageService(db),
	}
}

func (s *ChatHistoryUsecase) GetRecentHistory(userId, dialogueId string, numberOfMessages int) (map[string]interface{}, error) {
	dialogue, err := s.dialogueService.GetDialogueById(userId, dialogueId)
	if err != nil {
		return nil, err
	}

	messages, err := s.messageService.GetMessageByDialogueId(dialogue.ID, numberOfMessages)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"userId":     messages.UserId,
		"dialogueId": messages.DialogueId,
		"messages":   messages.Messages,
	}, nil
}

func (s *ChatHistoryUsecase) GetChatHistory(userId, dialogueId, chatType string, size int, cursor string) (map[string]interface{}, error) {
	dialogue, err := s.getDialogueByIdOrChatType(userId, dialogueId, chatType)
	if err != nil {
		return nil, err
	}

	messages, hasMore, err := s.messageService.GetMessageByPagination(dialogue.ID, size, cursor)
	if err != nil {
		return nil, err
	}

	var nextCursor string
	if len(messages) > 0 {
		nextCursor = messages[0].CreatedAt.Format(time.RFC3339)
	}

	return map[string]interface{}{
		"dialogue":     dialogue,
		"chatMessages": messages,   // Changed to match frontend
		"nextCursor":   nextCursor, // Add next cursor for pagination
		"hasMore":      hasMore,    // Indicate if there are more messages
	}, nil
}

func (s *ChatHistoryUsecase) getDialogueByIdOrChatType(userId, dialogueId, chatType string) (entity.UserDialogueEntity, error) {
	var dialogue entity.UserDialogueEntity
	if dialogueId == "" {
		dialogue, err := s.dialogueService.GetDialogueByUserIdAndType(userId, chatType)
		if err != nil {
			return entity.UserDialogueEntity{}, err
		}
		return dialogue, nil
	}

	dialogue, err := s.dialogueService.GetDialogueById(userId, dialogueId)
	if err != nil {
		return entity.UserDialogueEntity{}, err
	}
	return dialogue, nil
}
