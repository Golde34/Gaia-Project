package entity

type UserDialogueEntity struct {
	ID             string `json:"id"`
	UserID         string `json:"user_id"`
	DialogueName   string `json:"dialogue_name"`
	DialogueType   string `json:"dialogue_type"`
	DialogueStatus bool   `json:"dialogue_status"`
	Metadata       string `json:"metadata"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}
