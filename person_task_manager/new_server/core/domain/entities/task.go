package entities

import "time"

type TaskEntity struct {
	ID           string    `db:"id" json:"id"`
	Title        string    `db:"title" json:"title"`
	Description  string    `db:"description" json:"description"`
	Priority     []string  `db:"priority" json:"priority"`
	Status       string    `db:"status" json:"status"`
	StartDate    time.Time `db:"start_date" json:"startDate"`
	Deadline     time.Time `db:"deadline" json:"deadline"`
	Duration     int       `db:"duration" json:"duration"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
	ActiveStatus string    `db:"active_status" json:"activeStatus"`
	GroupTaskID  string    `db:"group_task_id" json:"groupTaskId"`
	UserID       int       `db:"user_id" json:"userId"`
	Tag          []string  `db:"tag" json:"tag"`
}

func NewTask(row map[string]interface{}) *TaskEntity {
	return &TaskEntity{
		ID:           row["id"].(string),
		Title:        row["title"].(string),
		Description:  row["description"].(string),
		Priority:     row["priority"].([]string),
		Status:       row["status"].(string),
		StartDate:    row["start_date"].(time.Time),
		Deadline:     row["deadline"].(time.Time),
		Duration:     row["duration"].(int),
		CreatedAt:    row["created_at"].(time.Time),
		UpdatedAt:    row["updated_at"].(time.Time),
		ActiveStatus: row["active_status"].(string),
		GroupTaskID:  row["group_task_id"].(string),
		UserID:       row["user_id"].(int),
		Tag:          row["tag"].([]string),
	}
}
