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
