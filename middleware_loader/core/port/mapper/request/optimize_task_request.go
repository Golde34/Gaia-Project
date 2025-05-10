package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
)

func OptimizeTaskByUserRequestDTOMapper(body map[string]interface{}, userId string) request_dtos.OptimizeTaskByUser {
	var input request_dtos.OptimizeTaskByUser
	input.UserId = utils.ParseFloatValue(userId) 
	input.OptimizedDate = body["optimizedDate"].(string)

	return input
}