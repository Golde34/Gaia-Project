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

var (
	UserDialogueTable = `user_dialogues`
)

func (r *DialogueRepository) CreateDialogue(dialogue entity.UserDialogueEntity) (entity.UserDialogueEntity, error) {
    columns, values := base_repo.StructToColumnsAndValues(dialogue)
    log.Println("Inserting dialogue into database with columns:", columns, "and values:", values)
    id, err := r.base.InsertDB(UserDialogueTable, columns, values)
    if err != nil {
        return entity.UserDialogueEntity{}, err
    }
    dialogue.ID = id
    return dialogue, nil
}

func (r *DialogueRepository) GetDialogueByUserIdAndType(userId, dialogueType string) (entity.UserDialogueEntity, error) {
    where := map[string]interface{}{
        "user_id": userId,
        "dialogue_type": dialogueType,
    }
    rows, err := r.base.SelectDB(r.db, UserDialogueTable, []string{}, where)
    if err != nil {
        return entity.UserDialogueEntity{}, err
    }
    if len(rows) == 0 {
        return entity.UserDialogueEntity{}, sql.ErrNoRows
    }
    row := rows[0]
    log.Println("Retrieved dialogue from database:", row)
    dialogue := entity.UserDialogueEntity{
        ID:             base_repo.ToStringUUID(row["id"]),
        UserID:         row["user_id"].(int64),
        DialogueName:   row["dialogue_name"].(string),
        DialogueType:   row["dialogue_type"].(string),
        DialogueStatus: row["dialogue_status"].(bool),
        Metadata:       row["metadata"].(string),
    }
    return dialogue, nil
}

func (r *DialogueRepository) GetDialogueById(userId, dialogueId string) (entity.UserDialogueEntity, error) {
    where := map[string]interface{}{
        "user_id": userId,
        "id": dialogueId,
    }
    rows, err := r.base.SelectDB(r.db, UserDialogueTable, []string{}, where)
    if err != nil {
        return entity.UserDialogueEntity{}, err
    }
    if len(rows) == 0 {
        return entity.UserDialogueEntity{}, sql.ErrNoRows
    }
    row := rows[0]
    log.Println("Retrieved dialogue by ID from database:", row)
    dialogue := entity.UserDialogueEntity{
        ID:             base_repo.ToStringUUID(row["id"]),
        UserID:         row["user_id"].(int64),
        DialogueName:   row["dialogue_name"].(string),
        DialogueType:   row["dialogue_type"].(string),
        DialogueStatus: row["dialogue_status"].(bool),
        Metadata:       row["metadata"].(string),
    }
    return dialogue, nil
}