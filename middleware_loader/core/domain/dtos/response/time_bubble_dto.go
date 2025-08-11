package response_dtos

type TimeBubbleConfigDTO struct {
	Id           string  `json:"id"`
	UserId       float64 `json:"userId"`
	DayOfWeek    float64 `json:"dayOfWeek"`
	DayOfWeekStr string  `json:"dayOfWeekStr"`
	StartTime    string  `json:"startTime"`
	EndTime      string  `json:"endTime"`
	Tag          string  `json:"tag"`
	Status       string  `json:"status"`
	CreatedAt    string  `json:"createdAt"`
	UpdatedAt    string  `json:"updatedAt"`
}

func NewTimeBubbleConfigDTO() *TimeBubbleConfigDTO {
	return &TimeBubbleConfigDTO{}
}
