package response_dtos

type TaskResultMessageDTO struct {
	Type       string                 `json:"type"`
	Response   string                 `json:"response"`
	TaskResult map[string]interface{} `json:"taskResult"`
}
