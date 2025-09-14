package client_adapter

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	mapper_response "middleware_loader/core/port/mapper/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type ScheduleCalendarAdapter struct{}

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
	userDailyTasksURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-day/daily-schedule-tasks/" + userId
	var scheduleTasks []response_dtos.ScheduleTaskResponseDTO
	var dailyCalendar []response_dtos.DailyCalendarResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userDailyTasksURL, "GET", nil, headers)
	if err != nil {
		return response_dtos.DailyTasksResponseDTO{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return response_dtos.DailyTasksResponseDTO{}, nil
	}
	if bodyResultMap["tasks"] != nil && len(bodyResultMap["tasks"].([]interface{})) > 0 {
		for _, task := range bodyResultMap["tasks"].([]interface{}) {
			taskMap, ok := task.(map[string]interface{})
			if !ok {
				continue
			}
			scheduleTask := mapper_response.ReturnScheduleTaskObjectMapper(taskMap)
			scheduleTasks = append(scheduleTasks, *scheduleTask)
		}
	}
	if bodyResultMap["dailyCalendar"] != nil && len(bodyResultMap["dailyCalendar"].([]interface{})) > 0 {
		for _, scheduleDay := range bodyResultMap["dailyCalendar"].([]interface{}) {
			calendarComponent := mapper_response.ReturnDailyCalendarObjectMapper(scheduleDay.(map[string]interface{}))
			dailyCalendar = append(dailyCalendar, *calendarComponent)
		}
	} 

	return response_dtos.DailyTasksResponseDTO{
		Message: bodyResultMap["message"].(string),
		Tasks:   scheduleTasks,
		DailyCalendar: dailyCalendar,
	}, nil
}

func (adapter *ScheduleCalendarAdapter) RegisterScheduleCalendar(userId string) (response_dtos.RegisteredCalendarStatusResponseDTO, error) {
	registerCalendarURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-day/register-time-bubble"
	headers := utils.BuildDefaultHeaders()
	body := map[string]interface{}{
		"userId": userId,
	}
	bodyResult, err := utils.BaseAPI(registerCalendarURL, "POST", body, headers)
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

func (adapter *ScheduleCalendarAdapter) GenerateDailyCalendar(userId string, dailyTasks map[string]interface{}) (map[string]interface{}, error) {
	generateDailyCalendarURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-day/generate-daily-calendar"
	var body = map[string]interface{}{
		"userId":     userId,
		"dailyTasks": dailyTasks,
	}
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(generateDailyCalendarURL, "POST", body, headers)
	if err != nil {
		return nil, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return nil, nil
	}

	return bodyResultMap, nil
}

func (adapter *ScheduleCalendarAdapter) EditTimeBubble(userId string, timeBubble map[string]interface{}) (map[string]interface{}, error) {
	editedTimeBubbleURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-day/edit-time-bubble"
	var body = map[string]interface{}{
		"userId":     userId,
		"timeBubble": timeBubble,
	}
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(editedTimeBubbleURL, "POST", body, headers)
	if err != nil {
		return nil, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return nil, nil
	}

	return bodyResultMap, nil
}

func (adapter *ScheduleCalendarAdapter) DeleteTaskAwaySchedule(userId string, taskId string) (map[string]interface{}, error) {
	editedTimeBubbleURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-day/delete-task-away-schedule"
	var body = map[string]interface{}{
		"userId":     userId,
		"taskId": taskId,
	}
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(editedTimeBubbleURL, "PUT", body, headers)
	if err != nil {
		return nil, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return nil, nil
	}

	return bodyResultMap, nil
}