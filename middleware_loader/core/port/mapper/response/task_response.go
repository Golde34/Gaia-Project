package mapper

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/kernel/utils"
)

func ReturnTaskObjectMapper(body map[string]interface{}) *response_dtos.TaskResponseDTO {
	var input response_dtos.TaskResponseDTO
	input.ID = body["_id"].(string)
	input.Title = body["title"].(string)
	if (body["description"] != nil) {
		input.Description = body["description"].(string)
	}
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.Status = body["status"].(string)
	if body["startDate"] != nil {
		input.StartDate = body["startDate"].(string)
	}
	input.Deadline = body["deadline"].(string)
	if body["duration"] != nil {
		input.Duration = body["duration"].(float64)
	}
	input.ActiveStatus = body["activeStatus"].(string)
	input.CreatedAt = body["createdAt"].(string)
	input.UpdatedAt = body["updatedAt"].(string)
	if body["groupTaskId"] != nil {
		input.GroupTaskId = body["groupTaskId"].(string)
	}
	input.SubTasks = utils.ConvertStringToStringArray(body["subTasks"].([]interface{}))
	input.Comments = utils.ConvertStringToStringArray(body["comments"].([]interface{}))
	return &input	
}

func ReturnCountDoneTaskMapper(body map[string]interface{}) *response_dtos.CountDoneTaskListDTO {
	var input response_dtos.CountDoneTaskListDTO
	input.GroupTaskId = body["groupTaskId"].(string)
	input.Count = body["count"].(float64)
	return &input
}