package response_dtos

type UserLLMModelConfigDTO struct {
	ModelId      float64 `json:"modelId"`
	ModelName    string  `json:"modelName"`
	ActiveStatus bool    `json:"activeStatus"`
}

type TokenResponse struct {
	Id          float64 `json:"id"`
	Username    string  `json:"username"`
	AccessToken string  `json:"accessToken"`
	ExpiryDate  string  `json:"expiryDate"`
	Valid       bool    `json:"valid"`
}
