package request_dtos

import "time"

type MessageRequestDTO struct {
	UserId        int64     `json:"user_id"`
	DialogueId    string    `json:"dialogue_id"`
	UserMessageId string    `json:"user_message_id"`
	OrderNumber   string    `json:"order_number"`
	MessageType   string    `json:"message_type"`
	Content       string    `json:"content"`
	Metadata      string    `json:"metadata"`
	EnumType      string    `json:"enum_type"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
