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

type DailyCalendarResponseDTO struct {
	ID string `json:"id"`
	UserId string `json:"userId"`
	StartTime string `json:"startTime"`
	EndTime string `json:"endTime"`
	PrimaryTaskId string `json:"primaryTaskId"`
	BackupTaskId string `json:"backupTaskId"`
	PrimaryTaskTitle string `json:"primaryTaskTitle"`
	BackupTaskTitle string `json:"backupTaskTitle"`
	Tag string `json:"tag"`
	WeekDay int `json:"weekDay"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func NewDailyCalendarResponseDTO() *DailyCalendarResponseDTO {
	return &DailyCalendarResponseDTO{}
}

type ScheduleResponseDTO struct {
	ID              string   `json:"id"`
	Title           string   `json:"title"`
	Priority        []string `json:"priority"`
	Duration        float64  `json:"duration"`
	StartDate       string   `json:"startDate"`
	Deadline        string   `json:"deadline"`
	ActiveStatus    string   `json:"activeStatus"`
	PreferenceLevel float64  `json:"preferenceLevel"`
	Repeat          []string `json:"repeat"`
}

func NewScheduleResponseDTO() *ScheduleResponseDTO {
	return &ScheduleResponseDTO{}
}

type DailyTasksResponseDTO struct {
	Message string `json:"message"`
	Tasks   []ScheduleTaskResponseDTO `json:"tasks"`
	DailyCalendar []DailyCalendarResponseDTO `json:"dailyCalendar"`
}

func NewDailyTasksResponseDTO() *DailyTasksResponseDTO {
	return &DailyTasksResponseDTO{}
}

type RegisteredCalendarStatusResponseDTO struct {
	Status string `json:"status"`
	Message string `json:"message"`
}

func NewRegisteredCalendarStatusResponseDTO() *RegisteredCalendarStatusResponseDTO {
	return &RegisteredCalendarStatusResponseDTO{}
}
