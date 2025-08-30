package response_dtos

type MessageResponseDTO struct {
	Message    string `json:"message"`
	Metadata   string `json:"metadata"`
}

type RecentHistory struct {
	UserId     int64                `json:"userId"`
	DialogueId string               `json:"dialogueId"`
	Messages   []MessageResponseDTO `json:"messages"`
}
