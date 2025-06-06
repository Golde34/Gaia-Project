package mapper

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/kernel/utils"
)

func ReturnScheduleObjectMapper(body map[string]interface{}) *response_dtos.ScheduleGroupResponseDTO{
	var input response_dtos.ScheduleGroupResponseDTO
	input.ID = body["id"].(string)
	input.Title = body["title"].(string)
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.Status = body["status"].(string)
	input.StartHour = body["startHour"].(float64)
	input.StartMinute = body["startMinute"].(float64)
	input.EndHour = body["endHour"].(float64)
	input.EndMinute = body["endMinute"].(float64)
	input.Duration = body["duration"].(float64)
	input.PreferenceLevel = body["preferenceLevel"].(float64)
	input.Repeat = utils.ConvertStringToStringArray(body["repeat"].([]interface{}))
	input.IsNotify = body["isNotify"].(bool)
	input.ActiveStatus = body["activeStatus"].(string)
	return &input
}
