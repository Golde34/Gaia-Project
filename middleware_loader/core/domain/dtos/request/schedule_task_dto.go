package request_dtos

type ChooseTaskBatchDTO struct {
	UserId      float64 `json:"userId"`
	BatchNumber float64 `json:"batchNumber"`
}

func NewChooseTaskBatchDTO() *ChooseTaskBatchDTO {
	return &ChooseTaskBatchDTO{}
}

func (in *ChooseTaskBatchDTO) MapperToModel(userId, batchNumber float64) {
	in.UserId = userId
	in.BatchNumber = batchNumber
}

type CreateScheduleTaskRequestDTO struct {
	Title          string   `json:"title"`
	StartDate      string   `json:"startDate"`
	Deadline       string   `json:"deadline"`
	Duration       float64  `json:"duration"`
	ActiveStatus   string   `json:"activeStatus"`
	Priority       []string `json:"priority"`
	SchedulePlanId string   `json:"schedulePlanId"`
	Repeat         string   `json:"repeat"`
	IsNotify       bool     `json:"isNotify"`
}

func NewCreateScheduleTaskRequestDTO() *CreateScheduleTaskRequestDTO {
	return &CreateScheduleTaskRequestDTO{}
}
