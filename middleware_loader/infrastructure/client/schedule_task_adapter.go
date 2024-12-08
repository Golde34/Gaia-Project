package client_adapter

import (
	"encoding/json"
	response_dtos "middleware_loader/core/domain/dtos/response"
	mapper_response "middleware_loader/core/port/mapper/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type ScheduleTaskAdapter struct {}

func NewScheduleTaskAdapter() *ScheduleTaskAdapter {
	return &ScheduleTaskAdapter{}
}

func (adapter *ScheduleTaskAdapter) GetScheduleTaskListByUserId(userId string) ([]response_dtos.ScheduleTaskResponseDTO, error) {
	listScheduleTaskURL := base.SchedulePlanServiceURL+ "/schedule-plan/schedule/get-schedule-task-list/" + userId
	var scheduleTasks []response_dtos.ScheduleTaskResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(listScheduleTaskURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.ScheduleTaskResponseDTO{}, err
	}	

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.ScheduleTaskResponseDTO{}, nil
	}
	for _, scheduleTaskElement := range bodyResultMap["scheduleTaskList"].([]interface{}) {
		scheduleTask := mapper_response.ReturnScheduleTaskObjectMapper(scheduleTaskElement.(map[string]interface{}))
		scheduleTasks = append(scheduleTasks, *scheduleTask)
	}

	return scheduleTasks, nil
}

func (adapter *ScheduleTaskAdapter) GetTaskBatchListByUserId(userId string) (response_dtos.ScheduleTaskBatchListResponseDTO, error) {
	listTaskBatchURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule/get-schedule-batch-task/" + userId
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(listTaskBatchURL, "GET", nil, headers)
	if err != nil {
		return response_dtos.ScheduleTaskBatchListResponseDTO{}, err
	}

	data, err := json.Marshal(bodyResult)
	if err != nil {
		return response_dtos.ScheduleTaskBatchListResponseDTO{}, err
	}

	var dto response_dtos.ScheduleTaskBatchListResponseDTO
	err = json.Unmarshal(data, &dto)
	if err != nil {
		return response_dtos.ScheduleTaskBatchListResponseDTO{}, err
	}

	return dto, nil
}