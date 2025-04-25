package response_dtos

type UserLLMModelConfigDTO struct {
	ModelId      float64 `json:"modelId"`
	ModelName    string  `json:"modelName"`
	ActiveStatus bool    `json:"activeStatus"`
}
