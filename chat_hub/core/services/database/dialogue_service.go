package services

import (
	entity "chat_hub/core/domain/entities"
	"chat_hub/core/domain/enums"
	"database/sql"
	"log"

	"github.com/google/uuid"
)

type DialogueService struct {
	db *sql.DB
}

func NewDialogueService(db *sql.DB) *DialogueService {
	return &DialogueService{
		db: db,
	}
}

func (s *DialogueService) CreateDialogue(userId, dialogueType string) (entity.UserDialogueEntity, error) {
	log.Println("Creating dialogue for user:", userId, "with dialog type:", dialogueType)

	dialogue := entity.UserDialogueEntity{
		ID:             uuid.New().String(),
		UserID:         userId,
		DialogueName:   enums.GaiaIntroductionDialogue,
		DialogueType:   enums.GaiaIntroductionDialogueType,
		DialogueStatus: enums.ACTIVE,
		Metadata:       "{}",
	}

	// store in repository
	log.Println("Storing dialogue in repository:", dialogue)

	return entity.UserDialogueEntity{}, nil
}

// func (s *DialogueService) CreateDialogue(dialogue entity.UserDialogueEntity) (entity.UserDialogueEntity, error) {
// 	log.Println("Creating dialogue for user:", dialogue.UserID, "with dialog type:", dialogue.DialogueType)

// 	query := `
// 		INSERT INTO user_dialogues (id, user_id, dialogue_name, dialogue_type, dialogue_status, metadata)
// 		VALUES ($1, $2, $3, $4, $5, $6)
// 		ON CONFLICT (id) DO UPDATE SET
// 			user_id = EXCLUDED.user_id,
// 			dialogue_name = EXCLUDED.dialogue_name,
// 			dialogue_type = EXCLUDED.dialogue_type,
// 			dialogue_status = EXCLUDED.dialogue_status,
// 			metadata = EXCLUDED.metadata
// 		RETURNING id, user_id, dialogue_name, dialogue_type, dialogue_status, metadata;
// 	`

// 	_, err := s.db.Exec(query, dialogue.ID, dialogue.UserID, dialogue.DialogueName,
// 		dialogue.DialogueType, dialogue.DialogueStatus, dialogue.Metadata)
// 	if err != nil {
// 		log.Println("Error inserting dialogue into database:", err)
// 		return entity.UserDialogueEntity{}, err
// 	}

// 	return dialogue, nil
// }
