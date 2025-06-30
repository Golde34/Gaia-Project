package usecases

import (
	services "chat_hub/core/services/chat"
	"database/sql"
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
		"dialogue": dialogue,
		"messages": messages,
	}, nil
}
