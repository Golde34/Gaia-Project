package request

type CreateProjectRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	UserID       int    `json:"userId"`
	Color        string `json:"color"`
	Status       string `json:"status"`
	ActiveStatus string `json:"activeStatus"`
}
