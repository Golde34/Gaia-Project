package request_dtos

type MessageRequestDTO struct {
	UserId        string `json:"user_id"`
	DialogueId    string `json:"dialogue_id"`
	UserMessageId string `json:"user_message_id"`
	OrderNumber   string `json:"order_number"`
	MessageType   string `json:"message_type"`
	Content       string `json:"content"`
	Metadata      string `json:"metadata"`
	EnumType      string `json:"enum_type"`
}
