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

type CreateScheduleGroupRequestDTO struct {
	UserId         string   `json:"userId"`
	GroupTaskId    string   `json:"groupTaskId"`
	Title          string   `json:"title"`
	Priority       []string `json:"priority"`
	StartHour      string   `json:"startHour"`
	EndHour        string   `json:"endHour"`
	Duration       float64  `json:"duration"`
	Repeat         []string `json:"repeat"`
	IsNotify       bool     `json:"isNotify"`
	ActiveStatus   string   `json:"activeStatus"`
}

func NewCreateScheduleGroupRequestDTO() *CreateScheduleGroupRequestDTO {
	return &CreateScheduleGroupRequestDTO{}
}
