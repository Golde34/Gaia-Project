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
	// dialogues, err := s.dialogueService.GetDialoguesByUserId(userId)
	// if err != nil {
	// 	return nil, err
	// }

	// var dialoguesWithMessages []*services.DialogueWithMessages
	// for _, dialogue := range dialogues {
	// 	messages, err := s.messageService.GetMessagesByDialogueId(dialogue.ID)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	dialoguesWithMessages = append(dialoguesWithMessages, &services.DialogueWithMessages{
	// 		Dialogue:  dialogue,
	// 		Messages:  messages,
	// 	})
	// }

	// return dialoguesWithMessages, nil
	return nil, nil
}