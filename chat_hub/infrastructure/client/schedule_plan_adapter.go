package client

import (
	response_dtos "chat_hub/core/domain/dtos/response"
	"chat_hub/infrastructure/client/base"
	"chat_hub/kernel/utils"
)

type SchedulePlanAdapter struct{}

func NewSchedulePlanAdapter() *SchedulePlanAdapter {
	return &SchedulePlanAdapter{}
}

func (adapter *SchedulePlanAdapter) GetTimeBubbleConfig(userId string) ([]response_dtos.TimeBubbleConfigDTO, error) {
	userDailyTasksURL := base.SchedulePlanURL + "/schedule-plan/schedule-day/time-bubble-config/" + "1"
	var timeBubbles []response_dtos.TimeBubbleConfigDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userDailyTasksURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.TimeBubbleConfigDTO{}, err
	}
	bodyResultArray, ok := bodyResult.([]interface{})
	if !ok {
		return []response_dtos.TimeBubbleConfigDTO{}, nil
	}

	for _, item := range bodyResultArray {
		timeBubbleConfig := returnTimeBubbleConfigObjectMapper(item.(map[string]interface{}))
		timeBubbles = append(timeBubbles, *timeBubbleConfig)
	}

	return timeBubbles, nil
}

func returnTimeBubbleConfigObjectMapper(body map[string]interface{}) *response_dtos.TimeBubbleConfigDTO {
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
