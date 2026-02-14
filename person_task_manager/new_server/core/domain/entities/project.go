package entities

import (
	"personal_task_manager/core/domain/mapper"
	"time"
)

type ProjectEntity struct {
	ID           string    `db:"id" json:"id"`
	Name         string    `db:"name" json:"name"`
	Description  string    `db:"description" json:"description"`
	Status       string    `db:"status" json:"status"`
	Color        string    `db:"color" json:"color"`
	UserID       int       `db:"user_id" json:"userId"`
	ActiveStatus string    `db:"active_status" json:"activeStatus"`
	IsDefault    bool      `db:"is_default" json:"isDefault"`
	Tag          []string  `db:"tag" json:"tag"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

func NewProject(row map[string]interface{}) *ProjectEntity {
	project := &ProjectEntity{}
	mapper.MapToStruct(row, project)
	return project
}
