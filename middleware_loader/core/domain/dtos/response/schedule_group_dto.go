package response_dtos

type ScheduleGroupResponseDTO struct {
	ID              string   `json:"id"`
	Title           string   `json:"title"`
	Priority        []string `json:"priority"`
	Status          string   `json:"status"`
	StartHour       float64  `json:"startHour"`
	StartMinute     float64  `json:"startMinute"`
	EndHour         float64  `json:"endHour"`
	EndMinute       float64  `json:"endMinute"`
	Duration        float64  `json:"duration"`
	PreferenceLevel float64  `json:"preferenceLevel"`
	Repeat          []string `json:"repeat"`
	IsNotify        bool     `json:"isNotify"`
	ActiveStatus    string   `json:"activeStatus"`
}

func NewScheduleGroupResponseDTO() *ScheduleGroupResponseDTO {
	return &ScheduleGroupResponseDTO{}
}
