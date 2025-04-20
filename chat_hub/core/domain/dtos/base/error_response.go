package base_dtos 

type ErrorResponse struct {
	Status        string      `json:"status"`
	StatusMessage string      `json:"statusMessage"`
	ErrorCode     int         `json:"errorCode"`
	ErrorMessage  string      `json:"errorMessage"`
	Data          interface{} `json:"data"`
}
