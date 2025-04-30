package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
)

func CreateGroupTaskRequestDTOMapper(body map[string]interface{}) *request_dtos.CreateGroupTaskRequestDTO {
	var input request_dtos.CreateGroupTaskRequestDTO
	input.Title = utils.GetStringValue(body, "title", "")
	input.Description = utils.GetStringValue(body, "description", "")
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.Status = utils.GetStringValue(body, "status", "")
	input.ProjectId = utils.GetStringValue(body, "projectId", "")
	if body["tasks"] != nil {
		input.Tasks = utils.ConvertStringToStringArrayPointer(body["tasks"].([]interface{}))
	} else {
		input.Tasks = &[]string{}
	}
	return &input
}

func UpdateGroupTaskRequestDTOMapper(body map[string]interface{}, id string) *request_dtos.UpdateGroupTaskRequestDTO {
	var input request_dtos.UpdateGroupTaskRequestDTO
	input.GroupTaskId = id
	input.Title = utils.GetStringValue(body, "title", "")
	input.Description = utils.GetStringValue(body, "description", "")
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.Status = utils.GetStringValue(body, "status", "")
	input.ProjectId = utils.GetStringValue(body, "projectId", "")
	return &input
}

func UpdateGroupTaskNameRequestDTOMapper(body map[string]interface{}, groupTaskId string) *request_dtos.UpdateGroupTaskNameInputDTO {
	var input request_dtos.UpdateGroupTaskNameInputDTO
	input.Name = body["newName"].(string)
	input.ID = groupTaskId
	return &input
}

func GetProjectGroupTaskId(body map[string]interface{}, groupTaskId string) *request_dtos.GetProjectGroupTaskIdInputDTO {
	var input request_dtos.GetProjectGroupTaskIdInputDTO
	input.ProjectId = body["projectId"].(string)
	input.GroupTaskId = groupTaskId
	return &input
}


func GetTaskDetailRequestDTOMapper(body map[string]interface{}) request_dtos.GetTaskDetailInputDTO {
	var input request_dtos.GetTaskDetailInputDTO
	input.UserId = body["userId"].(float64)
	if body["taskId"] != nil {
		input.TaskId = body["taskId"].(string)
	}
	if body["scheduleTaskId"] != nil {
		input.ScheduleTaskId = body["scheduleTaskId"].(string)
	}
	input.TaskDetailType = body["taskDetailType"].(string)
	return input
}