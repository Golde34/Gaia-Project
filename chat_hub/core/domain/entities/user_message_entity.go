package entity

var (
	UserChatMessageTable = `user_messages`
)

type UserChatMessageEntity struct {
	ID          string  `json:"id"`
	UserID      float64 `json:"user_id"`
	DialogueID  string  `json:"dialogue_id"`
	MessageType string  `json:"message_type"`
	Content     string  `json:"content"`
	Metadata    string  `json:"metadata"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}
