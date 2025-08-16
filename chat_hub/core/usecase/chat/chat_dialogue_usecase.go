package usecases 

import (
	"chat_hub/core/services"
	"database/sql"
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

func (s *ChatDialogueUsecase) GetChatDialogues(userId string, size int, cursor string) ([]map[string]interface{}, error) {
	dialogues, hasMore, err := s.dialogueService.GetAllDialoguesByUserId(userId, size, cursor)
	if err != nil {
		return nil, err
	}

	var response[]map[string]interface{}
	for _, dialogue := range dialogues {
		response = append(response, map[string]interface{}{
			"dialogue": dialogue,
			"hasMore":  hasMore,
		})
	}

	return response, nil
}
