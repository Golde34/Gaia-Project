package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
	"strconv"
)

func ChooseTaskBatch(body map[string]interface{}) (float64, float64) {
	bodyMap := body["body"].(map[string]interface{})
	batchNumber := bodyMap["batchNumber"].(string)
	userId := bodyMap["userId"].(string)
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
	bodyMap := body["body"].(map[string]interface{})
	input.UserId = bodyMap["userId"].(string)
	input.SchedulePlanId = bodyMap["schedulePlanId"].(string)
	input.Title = bodyMap["title"].(string)
	input.GroupTaskId = bodyMap["groupTaskId"].(string)
	input.Title = bodyMap["title"].(string)
	input.Priority = utils.ConvertStringToStringArray(bodyMap["priority"].([]interface{}))
	input.Status = bodyMap["status"].(string)
	input.StartHour = bodyMap["startHour"].(string)
	input.EndHour = bodyMap["endHour"].(string)
	input.Duration = bodyMap["duration"].(float64)
	input.Repeat = utils.ConvertStringToStringArray(bodyMap["repeat"].([]interface{}))
	input.IsNotify = bodyMap["isNotify"].(bool)
	input.ActiveStatus = bodyMap["activeStatus"].(string)
	return input
}