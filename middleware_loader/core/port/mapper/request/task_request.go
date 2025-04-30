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
	input.Title = utils.ConvertStringWithPunctuation(body["title"].(string))
	input.Description = utils.ConvertStringWithPunctuation(body["description"].(string))
	input.Status = body["status"].(string)
	input.StartDate = body["startDate"].(string)
	input.Deadline = body["deadline"].(string)
	input.Duration = body["duration"].(string)
	input.ActiveStatus = body["activeStatus"].(string)
	input.GroupTaskId = body["groupTaskId"].(string)
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.UserId = body["userId"].(float64)
	return input
}

func UpdateTaskRequestDTOMapper(body map[string]interface{}, taskId string) request_dtos.UpdateTaskRequestDTO {
	var input request_dtos.UpdateTaskRequestDTO
	input.UserId = body["userId"].(float64)
	input.TaskId = taskId
	input.Title = utils.ConvertStringWithPunctuation(body["title"].(string))
	input.Description = utils.ConvertStringWithPunctuation(body["description"].(string))
	input.StartDate = body["startDate"].(string)
	input.Deadline = body["deadline"].(string)
	input.Duration = body["duration"].(float64)
	input.Status = body["status"].(string)
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.TaskOrder = body["taskOrder"].(float64)
	input.StopTime = body["stopTime"].(float64)
	input.ScheduleTaskId= body["scheduleTaskId"].(string)
	return input
}

func GenerateTaskRequestDTOMapper(body map[string]interface{}) request_dtos.GenerateTaskRequestDTO {
	var input request_dtos.GenerateTaskRequestDTO
	input.Title = utils.ConvertStringWithPunctuation(body["title"].(string))
	input.Description = utils.ConvertStringWithPunctuation(body["description"].(string))
	input.Status = body["status"].(string)
	input.StartDate = body["startDate"].(string)
	input.Deadline = body["deadline"].(string)
	input.Duration = body["duration"].(string)
	input.ActiveStatus = body["activeStatus"].(string)
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.ProjectID = body["projectId"].(string)
	input.UserID = body["userId"].(float64)
	return input
}

func UpdateTaskInDialogRequestDTOMapper(body map[string]interface{}, taskId string) request_dtos.UpdateTaskInDialogRequestDTO {
	var input request_dtos.UpdateTaskInDialogRequestDTO
	input.Title = utils.ConvertStringWithPunctuation(body["title"].(string))
	input.Description = utils.ConvertStringWithPunctuation(body["description"].(string))
	input.Status = body["status"].(string)
	input.TaskID = taskId

	return input
}

func MoveTaskRequestDTOMapper(body map[string]interface{}, taskId string) request_dtos.MoveTaskRequestDTO {
	var input request_dtos.MoveTaskRequestDTO
	input.OldGroupTaskID = body["oldGroupTaskId"].(string)
	input.NewGroupTaskID = body["newGroupTaskId"].(string)
	input.TaskID = taskId

	return input
}
	