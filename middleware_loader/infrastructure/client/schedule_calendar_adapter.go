package client_adapter

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	mapper_response "middleware_loader/core/port/mapper/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)
type ScheduleCalendarAdapter struct {}

func NewScheduleCalendarAdapter() *ScheduleCalendarAdapter {
	return &ScheduleCalendarAdapter{}
}

func (adapter *ScheduleCalendarAdapter) GetTimeBubbleConfig(userId string) ([]response_dtos.TimeBubbleConfigDTO, error) {
	userDailyTasksURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-day/time-bubble-config/" + userId 
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
		timeBubbleConfig := mapper_response.ReturnTimeBubbleConfigObjectMapper(item.(map[string]interface{}))
		timeBubbles = append(timeBubbles, *timeBubbleConfig)
	}

	return timeBubbles, nil
}


func (adapter *ScheduleCalendarAdapter) GetUserDailyTasks(userId string) (response_dtos.DailyTasksResponseDTO, error) {
	userDailyTasksURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-calendar/daily-calendar/" + userId
	var scheduleTasks []response_dtos.ScheduleTaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userDailyTasksURL, "GET", nil, headers)
	if err != nil {
		return response_dtos.DailyTasksResponseDTO{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return response_dtos.DailyTasksResponseDTO{}, nil
	}
	if bodyResultMap["tasks"] == nil || len(bodyResultMap["tasks"].([]interface{})) == 0 {
		return response_dtos.DailyTasksResponseDTO{
			Message: bodyResultMap["message"].(string),
			Tasks:   []response_dtos.ScheduleTaskResponseDTO{},
		}, nil
	}

	for _, task := range bodyResultMap["tasks"].([]interface{}) {
		taskMap, ok := task.(map[string]interface{})
		if !ok {
			continue
		}
		scheduleTask := mapper_response.ReturnScheduleTaskObjectMapper(taskMap)
		scheduleTasks = append(scheduleTasks, *scheduleTask)
	}

	return response_dtos.DailyTasksResponseDTO{
		Message: bodyResultMap["message"].(string),
		Tasks:   scheduleTasks,
	}, nil
}

func (adapter *ScheduleCalendarAdapter) RegisterScheduleCalendar(userId string, scheduleCalendar map[string]interface{}) (response_dtos.RegisteredCalendarStatusResponseDTO, error) {
	registerCalendarURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-calendar/register"
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(registerCalendarURL, "POST", scheduleCalendar, headers)
	if err != nil {
		return response_dtos.RegisteredCalendarStatusResponseDTO{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return response_dtos.RegisteredCalendarStatusResponseDTO{}, nil
	}

	return response_dtos.RegisteredCalendarStatusResponseDTO{
		Status:  bodyResultMap["status"].(string),
		Message: bodyResultMap["message"].(string),
	}, nil
}
