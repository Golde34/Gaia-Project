package entity

var (
	UserChatMessageTable = `user_messages`
)

type UserChatMessageEntity struct {
	ID          string  `db:"id"`
	UserID      float64 `db:"user_id"`
	DialogueID  string  `db:"dialogue_id"`
	MessageType string  `db:"message_type"`
	Content     string  `db:"content"`
	Metadata    string  `db:"metadata"`
	CreatedAt   string  `db:"created_at"`
	UpdatedAt   string  `db:"updated_at"`
}
