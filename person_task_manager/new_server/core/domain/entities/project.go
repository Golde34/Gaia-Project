package entities

import "time"

type ProjectEntity struct {
	ID           string    `db:"id" json:"id"`
	Name         string    `db:"name" json:"name"`
	Description  string    `db:"description" json:"description"`
	Status       string    `db:"status" json:"status"`
	Color        string    `db:"color" json:"color"`
	OwnerID      int       `db:"owner_id" json:"ownerId"`
	ActiveStatus string    `db:"active_status" json:"activeStatus"`
	IsDefault    bool      `db:"is_default" json:"isDefault"`
	Tag          []string  `db:"tag" json:"tag"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

func NewProject(row map[string]interface{}) *ProjectEntity {
	return &ProjectEntity{
		ID:           row["id"].(string),
		Name:         row["name"].(string),
		Description:  row["description"].(string),
		Status:       row["status"].(string),
		Color:        row["color"].(string),
		OwnerID:      row["owner_id"].(int),
		ActiveStatus: row["active_status"].(string),
		IsDefault:    row["is_default"].(bool),
		Tag:          row["tag"].([]string),
		CreatedAt:    row["created_at"].(time.Time),
		UpdatedAt:    row["updated_at"].(time.Time),
	}
}
