package response

import "time"

type ProjectWithGroupTasksResponse struct {
	UserID  int                    `db:"user_id" json:"userId"`
	Project ProjectContextResponse `json:"project"`
}

type ProjectContextResponse struct {
	ID           string                     `db:"id" json:"id"`
	Name         string                     `db:"name" json:"name"`
	Description  string                     `db:"description" json:"description"`
	Status       string                     `db:"status" json:"status"`
	Category     string                     `json:"category"`
	UserID       int                        `db:"user_id" json:"userId"`
	ActiveStatus string                     `db:"active_status" json:"activeStatus"`
	CreatedAt    time.Time                  `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time                  `db:"updated_at" json:"updatedAt"`
	GroupTasks   []GroupTaskContextResponse `json:"groupTasks"`
}
