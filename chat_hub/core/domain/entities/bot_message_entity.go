package entity

import "time"

type BotMessageEntity struct {
	ID            string    `db:"id"`
	UserId        int64     `db:"user_id"`
	DialogueId    string    `db:"dialogue_id"`
	UserMessageId string    `db:"user_message_id"`
	OrderNumber   int64     `db:"order_number"`
	MessageTyoe   string    `db:"message_type"`
	Content       string    `db:"content"`
	Metadata      string    `db:"metadata"`
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
}
