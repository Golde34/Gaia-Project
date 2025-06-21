package entity

type UserChatMessageEntity struct {
	ID          string `json:"id"`
	UserID      string `json:"user_id"`
	DialogueID  string `json:"dialogue_id"`
	Message     string `json:"message"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
	MessageType string `json:"message_type"`
	Metadata    string `json:"metadata"`
	Attachments string `json:"attachments"`
}