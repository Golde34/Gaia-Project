package repository

import (
	entity "chat_hub/core/domain/entities"
	base_repo "chat_hub/infrastructure/repository/base"
	"chat_hub/kernel/utils"
	"database/sql"
	"fmt"
	"log"
)

type DialogueRepository struct {
	db *sql.DB

	base *base_repo.DB
}

func NewDialogueRepository(db *sql.DB) *DialogueRepository {
	return &DialogueRepository{
		db:   db,
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
		"user_id":       userId,
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
		"id":      dialogueId,
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

func (r *DialogueRepository) GetAllDialoguesByUserId(userId string, size int, cursor string) ([]entity.UserDialogueEntity, bool, error) {
	size = utils.ValidatePagination(size)
	queryLimit := size + 1

	var (
		rows *sql.Rows
		err  error
	)

	baseQuery := fmt.Sprintf("SELECT * FROM %s WHERE user_id = $1", UserDialogueTable)

	if cursor == "" {
		query := baseQuery + `
            ORDER BY updated_at DESC
            LIMIT $2
        `
		rows, err = r.db.Query(query, userId, queryLimit)
	} else {
		query := baseQuery + `
            AND updated_at < $2::timestamp
            ORDER BY updated_at DESC
            LIMIT $3
        `
		rows, err = r.db.Query(query, userId, cursor, queryLimit)
	}

	if err != nil {
		return nil, false, fmt.Errorf("error executing query: %w", err)
	}
	defer rows.Close()

	var dialogues []entity.UserDialogueEntity
	for rows.Next() {
		var dialogue entity.UserDialogueEntity
		if err := rows.Scan(&dialogue.ID, &dialogue.UserID, &dialogue.DialogueName,
			&dialogue.DialogueType, &dialogue.DialogueStatus, &dialogue.Metadata,
			&dialogue.CreatedAt, &dialogue.UpdatedAt); err != nil {
			return nil, false, fmt.Errorf("error scanning row: %w", err)
		}
		dialogues = append(dialogues, dialogue)
	}

	if err := rows.Err(); err != nil {
		return nil, false, fmt.Errorf("error iterating rows: %w", err)
	}

	hasMore := len(dialogues) > size
	if hasMore {
		dialogues = dialogues[:size]
	}
	return dialogues, hasMore, nil
}
