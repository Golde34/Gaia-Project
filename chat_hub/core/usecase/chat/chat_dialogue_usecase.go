package usecases

import (
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/services"
	"database/sql"
	"time"
)

type ChatDialogueUsecase struct {
	db *sql.DB

	dialogueService *services.DialogueService
}

func NewChatDialogueUsecase(db *sql.DB) *ChatDialogueUsecase {
	return &ChatDialogueUsecase{
		db: db,

		dialogueService: services.NewDialogueService(db),
	}
}

func (s *ChatDialogueUsecase) GetChatDialogues(userId string, size int, cursor string) ([]entity.UserDialogueEntity, string, bool, error) {
	dialogues, hasMore, err := s.dialogueService.GetAllDialoguesByUserId(userId, size, cursor)
	if err != nil {
		return nil, "", false, err 
	}

	var nextCursor string
	if len(dialogues) > 0 {
		nextCursor = dialogues[0].CreatedAt.Format(time.RFC3339)
	}

	return dialogues, nextCursor, hasMore, nil
}
