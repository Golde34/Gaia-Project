package entity

type UserDialogueEntity struct {
	ID          string `json:"id"`
	UserID      string `json:"user_id"`
	DialogueID  string `json:"dialogue_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
	DialogueName string `json:"dialogue_name"`
	DialogueType string `json:"dialogue_type"`
	DialogueStatus string `json:"dialogue_status"`
	DialogueMetadata string `json:"dialogue_metadata"`
}

