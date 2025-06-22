package repository

import (
	entity "chat_hub/core/domain/entities"
	"database/sql"
	"log"
)

type DialogueRepository struct {
	db *sql.DB
}

func NewDialogueRepository(db *sql.DB) *DialogueRepository {
	return &DialogueRepository{
		db: db,
	}
}

func (r *DialogueRepository) CreateDialogue(dialogue entity.UserDialogueEntity) (entity.UserDialogueEntity, error) {
	log.Println("Creating dialogue for user:", dialogue.UserID, "with dialog type:", dialogue.DialogueType)

	query := `
		INSERT INTO user_dialogues (id, user_id, dialogue_name, dialogue_type, dialogue_status, metadata)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (id) DO UPDATE SET
			user_id = EXCLUDED.user_id,
			dialogue_name = EXCLUDED.dialogue_name,
			dialogue_type = EXCLUDED.dialogue_type,
			dialogue_status = EXCLUDED.dialogue_status,
			metadata = EXCLUDED.metadata
		RETURNING id, user_id, dialogue_name, dialogue_type, dialogue_status, metadata;
	`

	_, err := r.db.Exec(query, dialogue.ID, dialogue.UserID, dialogue.DialogueName,
		dialogue.DialogueType, dialogue.DialogueStatus, dialogue.Metadata)
	if err != nil {
		log.Println("Error inserting dialogue into database:", err)
		return entity.UserDialogueEntity{}, err
	}

	return dialogue, nil
}
