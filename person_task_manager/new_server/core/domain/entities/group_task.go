package entities

import "time"

type GroupTaskEntity struct {
	ID             string    `db:"id" json:"id"`
	Title          string    `db:"title" json:"title"`
	Description    string    `db:"description" json:"description"`
	Priority       []string  `db:"priority" json:"priority"`
	Status         string    `db:"status" json:"status"`
	TotalTasks     int       `db:"total_tasks" json:"totalTasks"`
	CompletedTasks int       `db:"completed_tasks" json:"completedTasks"`
	OrdinalNumber  int       `db:"ordinal_number" json:"ordinalNumber"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time `db:"updated_at" json:"updatedAt"`
	ActiveStatus   string    `db:"active_status" json:"activeStatus"`
	IsDefault      bool      `db:"is_default" json:"isDefault"`
	ProjectID      string    `db:"project_id" json:"projectId"`
	Tag            []string  `db:"tag" json:"tag"`
}

func NewGroupTask(row map[string]interface{}) *GroupTaskEntity {
	return &GroupTaskEntity{
		ID:             row["id"].(string),
		Title:          row["title"].(string),
		Description:    row["description"].(string),
		Priority:       row["priority"].([]string),
		Status:         row["status"].(string),
		TotalTasks:     row["total_tasks"].(int),
		CompletedTasks: row["completed_tasks"].(int),
		OrdinalNumber:  row["ordinal_number"].(int),
		CreatedAt:      row["created_at"].(time.Time),
		UpdatedAt:      row["updated_at"].(time.Time),
		ActiveStatus:   row["active_status"].(string),
		IsDefault:      row["is_default"].(bool),
		ProjectID:      row["project_id"].(string),
		Tag:            row["tag"].([]string),
	}
}
