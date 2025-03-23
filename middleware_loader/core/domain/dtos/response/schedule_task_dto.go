package response_dtos

type ScheduleTaskResponseDTO struct {
	ID                   string   `json:"id"`
	Title                string   `json:"title"`
	Priority             []string `json:"priority"`
	Status               string   `json:"status"`
	StartDate            string   `json:"startDate"`
	Deadline             string   `json:"deadline"`
	Duration             float64  `json:"duration"`
	ActiveStatus         string   `json:"activeStatus"`
	PreferenceLevel      float64  `json:"preferenceLevel"`
	TaskId               string   `json:"taskId"`
	IsSynchronizedWithWO bool     `json:"isSynchronizedWithWO"`
	SchedulePlanId       string   `json:"schedulePlanId"`
	StopTime             float64  `json:"stopTime"`
	TaskBatch            float64  `json:"taskBatch"`
	TaskOrder            float64  `json:"taskOrder"`
	Weight               float64  `json:"weight"`
}

func NewScheduleTaskResponseDTO() *ScheduleTaskResponseDTO {
	return &ScheduleTaskResponseDTO{}
}

type ScheduleTaskBatchListResponseDTO struct {
	ScheduleBatchTask map[string][]ScheduleTaskResponseDTO `json:"scheduleBatchTask"`
}

func NewScheduleTaskBatchListResponseDTO() *ScheduleTaskBatchListResponseDTO {
	return &ScheduleTaskBatchListResponseDTO{}
}

type ScheduleResponseDTO struct {
	ID              string   `json:"id"`
	Title           string   `json:"title"`
	Priority        []string `json:"priority"`
	Duration        float64  `json:"duration"`
	ActiveStatus    string   `json:"activeStatus"`
	PreferenceLevel float64  `json:"preferenceLevel"`
	Repeat          []string `json:"repeat"`
}

func NewScheduleResponseDTO() *ScheduleResponseDTO {
	return &ScheduleResponseDTO{}
}
