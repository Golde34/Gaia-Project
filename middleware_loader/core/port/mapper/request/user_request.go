package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
)

func UpdateUserRequestDTOMapper(body map[string]interface{}, userId string) *request_dtos.UpdateUserRequestDTO {
	var input request_dtos.UpdateUserRequestDTO


	input.UserId = utils.ParseFloatValue(userId) 
	input.Name = utils.GetStringValue(body, "name", "")
	input.Username = utils.GetStringValue(body, "username", "")
	input.Email = utils.GetStringValue(body, "email", "")
	input.Roles = utils.GetArrayStringValue(body, "roles", []string{})

	return &input
}

func GetUserId(userId string) *request_dtos.UserIdInputDTO {
	var input request_dtos.UserIdInputDTO
	input.UserId = utils.ParseFloatValue(userId)
	return &input
}

func GetUserIdInBody(userId string) *request_dtos.UserIdInputDTO {
	var input request_dtos.UserIdInputDTO
	input.UserId = utils.ParseFloatValue(userId) 
	return &input
}

func UpdateUserSettingRequestDTOMapper(body map[string]interface{}, userId string) *request_dtos.UpdateUserSettingRequestDTO {
	var input request_dtos.UpdateUserSettingRequestDTO
	input.UserId = utils.ParseFloatValue(userId)
	input.OptimizedTaskConfig = utils.GetFloatValue(body, "optimizedTaskConfig", 0) 
	input.PrivateProfileConfig = utils.GetFloatValue(body, "privateProfileConfig", 0)
	input.TaskSortingAlgorithm = utils.GetFloatValue(body, "taskSortingAlgorithm", 0)
	input.AutoOptimizeConfig = utils.GetFloatValue(body, "autoOptimizeConfig", 0)
	return &input
}

func UpdateUserModelRequestDTOMapper(body map[string]interface{}, userId string) request_dtos.UpdateUserModelRequestDTO {
	var input request_dtos.UpdateUserModelRequestDTO
	input.UserId = utils.ParseFloatValue(userId) 
	input.ModelId = utils.GetFloatValue(body, "modelId", 0)
	return input
}
