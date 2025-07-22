package entity

import "time"

type MessageEntity struct {
	ID            string    `db:"id" json:"id"`
	UserId        int64     `db:"user_id" json:"userId"`
	DialogueId    string    `db:"dialogue_id" json:"dialogueId"`
	UserMessageId string    `db:"user_message_id" json:"userMessageId"`
	MessageType   string    `db:"message_type" json:"messageType"`
	SenderType    string    `db:"sender_type" json:"senderType"`
	Content       string    `db:"content" json:"content"`
	Metadata      string    `db:"metadata" json:"metadata"`
	CreatedAt     time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt     time.Time `db:"updated_at" json:"updatedAt"`
}
