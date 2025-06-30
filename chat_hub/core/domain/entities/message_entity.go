package entity

import "time"

type MessageEntity struct {
	ID            string    `db:"id"`
	UserId        int64     `db:"user_id"`
	DialogueId    string    `db:"dialogue_id"`
	UserMessageId string    `db:"user_message_id"`
	MessageType   string    `db:"message_type"`
	SenderType    string    `db:"sender_type"`
	Content       string    `db:"content"`
	Metadata      string    `db:"metadata"`
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
}
