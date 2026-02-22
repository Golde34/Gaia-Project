package base_dtos 

type ErrorResponse struct {
	Status        string      `json:"status"`
	StatusMessage string      `json:"statusMessage"`
	ErrorCode     int         `json:"errorCode"`
	ErrorMessage  string      `json:"errorMessage"`
	Data          interface{} `json:"data"`
}

func NewErrorResponse(status, statusMessage string, errorCode int, errorMessage string, data interface{}) ErrorResponse {
	return ErrorResponse{
		Status:        status,
		StatusMessage: statusMessage,
		ErrorCode:     errorCode,
		ErrorMessage:  errorMessage,
		Data:          data,
	}
}

func NewSuccessResponse(errorMessage string, data interface{}) ErrorResponse {
	return ErrorResponse{
		Status:        "Success",
		StatusMessage: "Success",
		ErrorCode:     200,
		ErrorMessage:  errorMessage,
		Data:          data,
	}
}