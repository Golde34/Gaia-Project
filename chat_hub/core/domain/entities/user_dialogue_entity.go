package entity

import "time"

type UserDialogueEntity struct {
	ID             string    `db:"id"`
	UserID         int64     `db:"user_id"`
	DialogueName   string    `db:"dialogue_name"`
	DialogueType   string    `db:"dialogue_type"`
	DialogueStatus bool      `db:"dialogue_status"`
	Metadata       string    `db:"metadata"`
	CreatedAt      time.Time `db:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"`
}
