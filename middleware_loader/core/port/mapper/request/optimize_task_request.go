package mapper

import request_dtos "middleware_loader/core/domain/dtos/request"

func OptimizeTaskByUserRequestDTOMapper(body map[string]interface{}) request_dtos.OptimizeTaskByUser {
	var input request_dtos.OptimizeTaskByUser
	input.UserId = body["userId"].(float64)
	input.OptimizedDate = body["optimizedDate"].(string)

	return input
}