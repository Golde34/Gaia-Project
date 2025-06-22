package entity

import "time"

type UserChatMessageEntity struct {
	ID          string    `db:"id"`
	UserId      int64     `db:"user_id"`
	DialogueId  string    `db:"dialogue_id"`
	MessageType string    `db:"message_type"`
	OrderNumber int64     `db:"order_number"`
	Content     string    `db:"content"`
	Metadata    string    `db:"metadata"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}
