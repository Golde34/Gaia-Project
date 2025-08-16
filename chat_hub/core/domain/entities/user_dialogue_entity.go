package entity

import "time"

type UserDialogueEntity struct {
	ID             string    `db:"id" json:"id"`
	UserID         int64     `db:"user_id" json:"userId"`
	DialogueName   string    `db:"dialogue_name" json:"dialogueName"`
	DialogueType   string    `db:"dialogue_type" json:"dialogueType"`
	DialogueStatus bool      `db:"dialogue_status" json:"dialogueStatus"`
	Metadata       string    `db:"metadata" json:"metadata"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time `db:"updated_at" json:"updatedAt"`
}

func NewUserDialogueRow(row map[string]interface{}) UserDialogueEntity {
	return UserDialogueEntity{
		ID:             string(row["id"].([]byte)),
		UserID:         row["user_id"].(int64),
		DialogueName:   row["dialogue_name"].(string),
		DialogueType:   row["dialogue_type"].(string),
		DialogueStatus: row["dialogue_status"].(bool),
		Metadata:       row["metadata"].(string),
		CreatedAt:      row["created_at"].(time.Time),
		UpdatedAt:      row["updated_at"].(time.Time),
	}
}
