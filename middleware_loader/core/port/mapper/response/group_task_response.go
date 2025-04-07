package mapper

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/kernel/utils"
)

func ReturnGroupTaskObjectMapper(body map[string]interface{}) *response_dtos.GroupTaskResponseDTO {
	var input response_dtos.GroupTaskResponseDTO
	input.ID = body["_id"].(string)
	input.Title = body["title"].(string)
	if body["description"] == nil {
		input.Description = ""
	} else {
		input.Description = body["description"].(string)
	}
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.Status = body["status"].(string)
	input.Tasks = utils.ConvertStringToStringArray(body["tasks"].([]interface{}))
	if body["totalTasks"] != nil {
		totalTasks := int(body["totalTasks"].(float64))
		input.TotalTasks = &totalTasks
	}
	if body["completedTasks"] != nil {
		completedTasks := int(body["completedTasks"].(float64))
		input.CompletedTasks = &completedTasks
	}
	if body["ordinalNumber"] != nil {
		ordinalNumber := int(body["ordinalNumber"].(float64))
		input.OrdinalNumber = &ordinalNumber
	}
	input.CreatedAt = body["createdAt"].(string)
	input.UpdatedAt = body["updatedAt"].(string)
	input.ActiveStatus = body["activeStatus"].(string)
	return &input
}
