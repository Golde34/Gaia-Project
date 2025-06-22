package entity

var (
	BotMessageTable = `bot_messages`
)

type BotMessageEntity struct {
	ID            string  `json:"id"`
	UserID        float64 `json:"user_id"`
	DialogueID    string  `json:"dialogue_id"`
	UserMessageId string  `json:"user_message_id"`
	OrderNumber   float64 `json:"order_number"`
	MessageTyoe   string  `json:"message_type"`
	Content       string  `json:"content"`
	Metadata      string  `json:"metadata"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}
