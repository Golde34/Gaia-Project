package utils 

import "middleware_loader/core/domain/dtos/base"

func ReturnErrorResponse(statusCode int, message string) base_dtos.ErrorResponse {
	switch status := statusCode; status {
	case 400:
		return base_dtos.ErrorResponse{
			Status:        "error",
			StatusMessage: "Bad Request",
			ErrorCode:     400,
			ErrorMessage:  message,
		}
	case 401:
		return base_dtos.ErrorResponse{
			Status:        "error",
			StatusMessage: "Unauthorized",
			ErrorCode:     401,
			ErrorMessage:  message,
		}
	case 403:
		return base_dtos.ErrorResponse{
			Status:        "error",
			StatusMessage: "Forbidden",
			ErrorCode:     403,
			ErrorMessage:  message,
		}
	case 404:
		return base_dtos.ErrorResponse{
			Status:        "error",
			StatusMessage: "Not Found",
			ErrorCode:     404,
			ErrorMessage:  message,
		}
	case 429:
		return base_dtos.ErrorResponse{
			Status:        "error",
			StatusMessage: "Too Many Requests",
			ErrorCode:     429,
			ErrorMessage:  message,
		}
	case 500:
		return base_dtos.ErrorResponse{
			Status:        "error",
			StatusMessage: "Internal Server Error",
			ErrorCode:     500,
			ErrorMessage:  message,
		}	
	default:
		return base_dtos.ErrorResponse{
			Status:        "error",
			StatusMessage: "Bad Request",
			ErrorCode:     400,
			ErrorMessage:  "",
		}
	}
}

func ReturnSuccessResponse(errorMessage string, data interface{}) base_dtos.ErrorResponse {
	return base_dtos.ErrorResponse{
		Status: "success",
		StatusMessage: "OK",
		ErrorCode: 200,
		ErrorMessage: errorMessage,
		Data: data,
	}
}
