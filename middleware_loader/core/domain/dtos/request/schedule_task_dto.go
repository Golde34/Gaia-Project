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
	Title        string   `json:"title"`
	Duration     float64  `json:"duration"`
	Description  string   `json:"description"`
	StartHour    string   `json:"startHour"`
	EndHour      string   `json:"endHour"`
	ActiveStatus string   `json:"activeStatus"`
	Priority     []string `json:"priority"`
	UserId       string   `json:"userId"`
	Repeat       []string `json:"repeat"`
	IsNotify     bool     `json:"isNotify"`
}

func NewCreateScheduleTaskRequestDTO() *CreateScheduleTaskRequestDTO {
	return &CreateScheduleTaskRequestDTO{}
}
