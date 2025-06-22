package entity

var (
	BotMessageTable = `bot_messages`
)

type BotMessageEntity struct {
	ID            string  `db:"id"`
	UserID        float64 `db:"user_id"`
	DialogueID    string  `db:"dialogue_id"`
	UserMessageId string  `db:"user_message_id"`
	OrderNumber   float64 `db:"order_number"`
	MessageTyoe   string  `db:"message_type"`
	Content       string  `db:"content"`
	Metadata      string  `db:"metadata"`
	CreatedAt     string  `db:"created_at"`
	UpdatedAt     string  `db:"updated_at"`
}
