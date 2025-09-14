package mapper

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/kernel/utils"
)

func ReturnScheduleTaskObjectMapper(body map[string]interface{}) *response_dtos.ScheduleTaskResponseDTO {
	var input response_dtos.ScheduleTaskResponseDTO
	input.ID = body["id"].(string)
	input.Title = body["title"].(string)
	input.Priority = utils.ConvertStringToStringArray(body["priority"].([]interface{}))
	input.Status = body["status"].(string)
	input.StartDate = body["startDate"].(string)
	input.Deadline = body["deadline"].(string)
	input.Duration = body["duration"].(float64)
	input.ActiveStatus = body["activeStatus"].(string)
	input.PreferenceLevel = body["preferenceLevel"].(float64)
	input.TaskId = body["taskId"].(string)
	if body["isSynchronizedWithWO"] != nil {
		input.IsSynchronizedWithWO = body["isSynchronizedWithWO"].(bool)
	}
	if body["taskOrder"] != nil {
		input.TaskOrder = body["taskOrder"].(float64)
	}
	if body["weight"] != nil {
		input.Weight = body["weight"].(float64)
	}
	if body["stopTime"] != nil {
		input.StopTime = body["stopTime"].(float64)
	}
	if body["taskBatch"] != nil {
		input.TaskBatch = body["taskBatch"].(float64)
	}
	if body["schedulePlanId"] != nil {
		input.SchedulePlanId = body["schedulePlanId"].(string)
	}
	return &input
}

func ReturnTimeBubbleConfigObjectMapper(body map[string]interface{}) *response_dtos.TimeBubbleConfigDTO {
	var input response_dtos.TimeBubbleConfigDTO
	input.Id = body["id"].(string)
	input.UserId = body["userId"].(string)
	input.DayOfWeek = body["dayOfWeek"].(float64)
	input.DayOfWeekStr = body["dayOfWeekStr"].(string)
	input.Tag = body["tag"].(string)
	input.Status = body["status"].(string)
	input.StartTime = body["startTime"].(string)
	input.EndTime = body["endTime"].(string)
	return &input
}

func ReturnDailyCalendarObjectMapper(body map[string]interface{}) *response_dtos.DailyCalendarResponseDTO {
	var input response_dtos.DailyCalendarResponseDTO
	input.ID = body["id"].(string)
	input.UserId = body["userId"].(string)
	input.StartTime = body["startTime"].(string)
	input.EndTime = body["endTime"].(string)
	if body["primaryTaskId"] != nil {
		input.PrimaryTaskId = body["primaryTaskId"].(string)
	}
	if body["backupTaskId"] != nil {
		input.BackupTaskId = body["backupTaskId"].(string)
	}
	if body["primaryTaskTitle"] != nil {
		input.PrimaryTaskTitle = body["primaryTaskTitle"].(string)
	}
	if body["backupTaskTitle"] != nil {
		input.BackupTaskTitle = body["backupTaskTitle"].(string)
	}
	input.Tag = body["tag"].(string)
	input.TimeBubbleId = body["timeBubbleId"].(string)
	return &input
}