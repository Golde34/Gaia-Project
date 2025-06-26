package request_dtos

type BotMessageRequestDTO struct {
	UserId      string `json:"user_id"`
	DialogueId  string `json:"dialogue_id"`
	Content     string `json:"query"`
	MessageType string `json:"type"`
	UserModel   string `json:"model_name"`
}

func NewBotMessageRequestDTO(userId, dialogueId, content, messageType, userModel string) *BotMessageRequestDTO {
	return &BotMessageRequestDTO{
		UserId:      userId,
		DialogueId:  dialogueId,
		Content:     content,
		MessageType: messageType,
		UserModel:   userModel,
	}
}