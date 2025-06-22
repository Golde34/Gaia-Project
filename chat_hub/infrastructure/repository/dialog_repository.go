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

func (r *DialogueRepository) GetDialogueByUserIdAndType(userId, dialogueType string) (entity.UserDialogueEntity, error) {
    log.Println("Retrieving dialogue for user:", userId, "with dialog type:", dialogueType)
    columns := []string{"id", "user_id", "dialogue_name", "dialogue_type", "dialogue_status", "metadata"}
    where := map[string]interface{}{
        "user_id": userId,
        "dialogue_type": dialogueType,
    }
    rows, err := r.base.SelectDB(r.db, "user_dialogues", columns, where)
    if err != nil {
        return entity.UserDialogueEntity{}, err
    }
    if len(rows) == 0 {
        return entity.UserDialogueEntity{}, sql.ErrNoRows
    }
    row := rows[0]
    dialogue := entity.UserDialogueEntity{
        ID:             row["id"].(string),
        UserID:         row["user_id"].(float64),
        DialogueName:   row["dialogue_name"].(string),
        DialogueType:   row["dialogue_type"].(string),
        DialogueStatus: row["dialogue_status"].(bool),
        Metadata:       row["metadata"].(string),
    }
    return dialogue, nil
}