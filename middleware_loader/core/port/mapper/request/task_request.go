package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
)

func GetTaskId(id string) request_dtos.IdInputDTO {
	var input request_dtos.IdInputDTO
	input.Id = id
	return input
}

func CreateTaskRequestDTOMapper(body map[string]interface{}) request_dtos.CreateTaskRequestDTO {
	var input request_dtos.CreateTaskRequestDTO
	bodyMap := body["body"].(map[string]interface{})
	input.Title = utils.ConvertStringWithPunctuation(bodyMap["title"].(string))
	input.Description = utils.ConvertStringWithPunctuation(bodyMap["description"].(string))
	input.Status = bodyMap["status"].(string)
	input.StartDate = bodyMap["startDate"].(string)
	input.Deadline = bodyMap["deadline"].(string)
	input.Duration = bodyMap["duration"].(string)
	input.ActiveStatus = bodyMap["activeStatus"].(string)
	input.GroupTaskId = bodyMap["groupTaskId"].(string)
	input.Priority = utils.ConvertStringToStringArray(bodyMap["priority"].([]interface{}))
	input.UserId = bodyMap["userId"].(float64)
	return input
}

func UpdateTaskRequestDTOMapper(body map[string]interface{}, taskId string) request_dtos.UpdateTaskRequestDTO {
	var input request_dtos.UpdateTaskRequestDTO
	bodyMap := body["body"].(map[string]interface{})
	input.UserId = bodyMap["userId"].(float64)
	input.TaskId = taskId
	input.Title = utils.ConvertStringWithPunctuation(bodyMap["title"].(string))
	input.Description = utils.ConvertStringWithPunctuation(bodyMap["description"].(string))
	input.StartDate = bodyMap["startDate"].(string)
	input.Deadline = bodyMap["deadline"].(string)
	input.Duration = bodyMap["duration"].(float64)
	input.Status = bodyMap["status"].(string)
	input.Priority = utils.ConvertStringToStringArray(bodyMap["priority"].([]interface{}))
	input.TaskOrder = bodyMap["taskOrder"].(float64)
	input.StopTime = bodyMap["stopTime"].(float64)
	input.ScheduleTaskId= bodyMap["scheduleTaskId"].(string)
	return input
}

func GenerateTaskRequestDTOMapper(body map[string]interface{}) request_dtos.GenerateTaskRequestDTO {
	var input request_dtos.GenerateTaskRequestDTO
	bodyMap := body["body"].(map[string]interface{})
	input.Title = utils.ConvertStringWithPunctuation(bodyMap["title"].(string))
	input.Description = utils.ConvertStringWithPunctuation(bodyMap["description"].(string))
	input.Status = bodyMap["status"].(string)
	input.StartDate = bodyMap["startDate"].(string)
	input.Deadline = bodyMap["deadline"].(string)
	input.Duration = bodyMap["duration"].(string)
	input.ActiveStatus = bodyMap["activeStatus"].(string)
	input.Priority = utils.ConvertStringToStringArray(bodyMap["priority"].([]interface{}))
	input.ProjectID = bodyMap["projectId"].(string)

	return input
}

func UpdateTaskInDialogRequestDTOMapper(body map[string]interface{}, taskId string) request_dtos.UpdateTaskInDialogRequestDTO {
	var input request_dtos.UpdateTaskInDialogRequestDTO
	bodyMap := body["body"].(map[string]interface{})
	input.Title = utils.ConvertStringWithPunctuation(bodyMap["title"].(string))
	input.Description = utils.ConvertStringWithPunctuation(bodyMap["description"].(string))
	input.Status = bodyMap["status"].(string)
	input.TaskID = taskId

	return input
}

func MoveTaskRequestDTOMapper(body map[string]interface{}, taskId string) request_dtos.MoveTaskRequestDTO {
	var input request_dtos.MoveTaskRequestDTO
	bodyMap := body["body"].(map[string]interface{})
	input.OldGroupTaskID = bodyMap["oldGroupTaskId"].(string)
	input.NewGroupTaskID = bodyMap["newGroupTaskId"].(string)
	input.TaskID = taskId

	return input
}
	