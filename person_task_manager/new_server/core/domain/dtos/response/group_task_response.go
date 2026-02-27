package response

import "time"

type GroupTaskContextResponse struct {
	ID           string    `db:"id" json:"id"`
	Title        string    `db:"title" json:"title"`
	Description  string    `db:"description" json:"description"`
	ActiveStatus string    `db:"active_status" json:"activeStatus"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}
