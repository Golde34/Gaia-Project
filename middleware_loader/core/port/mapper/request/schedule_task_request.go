package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
	"strconv"
)

func ChooseTaskBatch(body map[string]interface{}) (float64, float64) {
	batchNumber := body["batchNumber"].(string)
	userId := body["userId"].(string)
	userFloat, err := strconv.ParseFloat(userId, 64)
	if err != nil {
		return 0, 0
	}
	batchFloat, err := strconv.ParseFloat(batchNumber, 64)
	if err != nil {
		return 0, 0
	}
	return userFloat, batchFloat 
}

func CreateScheduleGroupRequestDTOMapper(body map[string]any) request_dtos.CreateScheduleGroupRequestDTO {
	var input request_dtos.CreateScheduleGroupRequestDTO
	input.UserId = body["userId"].(string)
	input.Title = body["title"].(string)
	if body["projectId"] != nil {
		input.ProjectId = body["projectId"].(string)
	} else {
		input.ProjectId = ""
	}
	if body["groupTaskId"] != nil {
		input.GroupTaskId = body["groupTaskId"].(string)
	} else {
		input.GroupTaskId = ""
	}
	input.Title = body["title"].(string)
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.StartHour = body["startHour"].(string)
	input.EndHour = body["endHour"].(string)
	input.Duration = body["duration"].(float64)
	input.Repeat = utils.ConvertStringToStringArray(body["repeat"].([]interface{}))
	input.IsNotify = body["isNotify"].(bool)
	input.ActiveStatus = body["activeStatus"].(string)
	return input
}