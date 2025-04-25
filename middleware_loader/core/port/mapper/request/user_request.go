package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
)

func UpdateUserRequestDTOMapper(body map[string]interface{}) *request_dtos.UpdateUserRequestDTO {
	var input request_dtos.UpdateUserRequestDTO
	bodyMap := body["body"].(map[string]interface{})

	input.UserId = utils.GetFloatValue(bodyMap, "userId", 0)
	input.Name = utils.GetStringValue(bodyMap, "name", "")
	input.Username = utils.GetStringValue(bodyMap, "username", "")
	input.Email = utils.GetStringValue(bodyMap, "email", "")
	input.Roles = utils.GetArrayStringValue(bodyMap, "roles", []string{})

	return &input
}

func GetUserId(userId string) *request_dtos.UserIdInputDTO {
	var input request_dtos.UserIdInputDTO
	input.UserId = utils.ParseFloatValue(userId)
	return &input
}

func GetUserIdInBody(body map[string]interface{}) *request_dtos.UserIdInputDTO {
	var input request_dtos.UserIdInputDTO
	bodyMap := body["body"].(map[string]interface{})
	input.UserId = utils.GetFloatValue(bodyMap, "userId", 0)
	return &input
}

func UpdateUserSettingRequestDTOMapper(body map[string]interface{}) *request_dtos.UpdateUserSettingRequestDTO {
	var input request_dtos.UpdateUserSettingRequestDTO
	bodyMap := body["body"].(map[string]interface{})
	input.UserId = utils.GetFloatValue(bodyMap, "userId", 0)
	input.OptimizedTaskConfig = utils.GetFloatValue(bodyMap, "optimizedTaskConfig", 0) 
	input.PrivateProfileConfig = utils.GetFloatValue(bodyMap, "privateProfileConfig", 0)
	input.TaskSortingAlgorithm = utils.GetFloatValue(bodyMap, "taskSortingAlgorithm", 0)
	input.AutoOptimizeConfig = utils.GetFloatValue(bodyMap, "autoOptimizeConfig", 0)
	return &input
}

func UpdateUserModelRequestDTOMapper(body map[string]interface{}) request_dtos.UpdateUserModelRequestDTO {
	var input request_dtos.UpdateUserModelRequestDTO
	bodyMap := body["body"].(map[string]interface{})
	input.UserId = utils.GetFloatValue(bodyMap, "userId", 0)
	input.ModelId = utils.GetFloatValue(bodyMap, "modelId", 0)
	return input
}
