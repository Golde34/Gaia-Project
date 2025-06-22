package repository

import (
	entity "chat_hub/core/domain/entities"
	base_repo "chat_hub/infrastructure/repository/base"
	"database/sql"
	"log"
)

type DialogueRepository struct {
	db *sql.DB

    base *base_repo.DB 
}

func NewDialogueRepository(db *sql.DB) *DialogueRepository {
    return &DialogueRepository{
		db: db,
        base: base_repo.NewDB(db), 
    }
}

func (r *DialogueRepository) CreateDialogue(dialogue entity.UserDialogueEntity) (entity.UserDialogueEntity, error) {
	log.Println("Creating dialogue for user:", dialogue.UserID, "with dialog type:", dialogue.DialogueType)
	columns := []string{"id", "user_id", "dialogue_name", "dialogue_type", "dialogue_status", "metadata"}
    values := []interface{}{dialogue.ID, dialogue.UserID, dialogue.DialogueName, dialogue.DialogueType, dialogue.DialogueStatus, dialogue.Metadata}
    id, err := r.base.InsertDB("user_dialogues", columns, values)
    if err != nil {
        return entity.UserDialogueEntity{}, err
    }
    dialogue.ID = id
    return dialogue, nil
}
