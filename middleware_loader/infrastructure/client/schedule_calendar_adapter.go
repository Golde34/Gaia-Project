package client_adapter

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)
type ScheduleCalendarAdapter struct {}

func NewScheduleCalendarAdapter() *ScheduleCalendarAdapter {
	return &ScheduleCalendarAdapter{}
}

func (adapter *ScheduleCalendarAdapter) GetUserDailyTasks(userId string) ([]response_dtos.ScheduleTaskResponseDTO, error) {
	userDailyTasksURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-calendar/daily-calendar/" + userId
	var scheduleTasks []response_dtos.ScheduleTaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(userDailyTasksURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.ScheduleTaskResponseDTO{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.ScheduleTaskResponseDTO{}, nil
	}
	task, exists := bodyResultMap["task"]
	if !exists || task == nil {
		return nil, nil
	}
	if taskList, ok := task.([]interface{}); ok && len(taskList) == 0 {
		return []response_dtos.ScheduleTaskResponseDTO{}, nil
	}

	for _, scheduleTaskElement := range bodyResultMap["task"].([]interface{}) {
		scheduleTask := response_dtos.ScheduleTaskResponseDTO{
			TaskId:   scheduleTaskElement.(map[string]interface{})["taskId"].(string),
			Title: scheduleTaskElement.(map[string]interface{})["taskName"].(string),
		}
		scheduleTasks = append(scheduleTasks, scheduleTask)
	}

	return scheduleTasks, nil
}