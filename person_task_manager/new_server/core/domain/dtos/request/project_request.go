package request

type ProjectRequest struct {
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	UserID       int      `json:"userId"`
	Color        string   `json:"color"`
	Status       string   `json:"status"`
	ActiveStatus string   `json:"activeStatus"`
	Tags         []string `json:"tags"`
}

type ProjectNameRequest struct {
	Name string `json:"name"`
}

type ProjectColorRequest struct {
	Color string `json:"color"`
}
