package entities

import "time"

type NoteEntity struct {
	ID                 string    `db:"id" json:"id"`
	Name               string    `db:"name" json:"name"`
	SummaryDisplayText string    `db:"summary_display_text" json:"summaryDisplayText"`
	FileID             string    `db:"file_id" json:"fileId"`
	FileName           string    `db:"file_name" json:"fileName"`
	FileLocation       string    `db:"file_location" json:"fileLocation"`
	FileStatus         string    `db:"file_status" json:"fileStatus"`
	IsLock             bool      `db:"is_lock" json:"isLock"`
	Tag                []string  `db:"tag" json:"tag"`
	ActiveStatus       string    `db:"active_status" json:"activeStatus"`
	NotePassword       string    `db:"note_password" json:"notePassword"`
	PasswordSuggestion string    `db:"password_suggestion" json:"passwordSuggestion"`
	CreatedAt          time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt          time.Time `db:"updated_at" json:"updatedAt"`
	OwnerID            int       `db:"owner_id" json:"ownerId"`
}

func NewNote(row map[string]interface{}) *NoteEntity {
	return &NoteEntity{
		ID:                 row["id"].(string),
		Name:               row["name"].(string),
		SummaryDisplayText: row["summary_display_text"].(string),
		FileID:             row["file_id"].(string),
		FileName:           row["file_name"].(string),
		FileLocation:       row["file_location"].(string),
		FileStatus:         row["file_status"].(string),
		IsLock:             row["is_lock"].(bool),
		Tag:                row["tag"].([]string),
		ActiveStatus:       row["active_status"].(string),
		NotePassword:       row["note_password"].(string),
		PasswordSuggestion: row["password_suggestion"].(string),
		CreatedAt:          row["created_at"].(time.Time),
		UpdatedAt:          row["updated_at"].(time.Time),
		OwnerID:            row["owner_id"].(int),
	}
}
