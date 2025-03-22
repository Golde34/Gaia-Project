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

func CreateScheduleTaskRequestDTOMapper(body map[string]interface{}) request_dtos.CreateScheduleTaskRequestDTO {
	var input request_dtos.CreateScheduleTaskRequestDTO
	bodyMap := body["body"].(map[string]interface{})
	input.Title = bodyMap["title"].(string)
	input.StartDate = bodyMap["startDate"].(string)
	input.Deadline = bodyMap["deadline"].(string)
	input.Duration = bodyMap["duration"].(float64)
	input.ActiveStatus = bodyMap["activeStatus"].(string)
	input.Priority = utils.ConvertStringToStringArray(bodyMap["priority"].([]interface{}))
	input.UserId = bodyMap["userId"].(string)
	input.Repeat = bodyMap["repeat"].(string)
	input.IsNotify = bodyMap["isNotify"].(bool)	
	return input
}