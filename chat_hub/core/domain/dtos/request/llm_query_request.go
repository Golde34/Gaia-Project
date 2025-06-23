package request_dtos

type LLMQueryRequestDTO struct {
	Query     string `json:"query"`
	ModelName string `json:"model_name"`
	UserId    string `json:"user_id"`
}

func NewLLMQueryRequestDTO() *LLMQueryRequestDTO {
	return &LLMQueryRequestDTO{}
}

type LLMSystemQueryRequestDTO struct {
	UserId string `json:"user_id"`
	Query  string `json:"query"`
	Type   string `json:"type"`
}

func NewLLMSystemQueryRequestDTO() *LLMSystemQueryRequestDTO {
	return &LLMSystemQueryRequestDTO{}
}
