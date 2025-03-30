package client_adapter

import (
	"encoding/json"
	request_dtos "middleware_loader/core/domain/dtos/request"
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
	listScheduleTaskURL := base.SchedulePlanServiceURL+ "/schedule-plan/schedule/get-task-list/" + userId
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
	scheduleTaskList, exists := bodyResultMap["scheduleTaskList"]
    if !exists || scheduleTaskList == nil {
        return nil, nil
    }
	if taskList, ok := scheduleTaskList.([]interface{}); ok && len(taskList) == 0 {
        return []response_dtos.ScheduleTaskResponseDTO{}, nil
    }

	for _, scheduleTaskElement := range bodyResultMap["scheduleTaskList"].([]interface{}) {
		scheduleTask := mapper_response.ReturnScheduleTaskObjectMapper(scheduleTaskElement.(map[string]interface{}))
		scheduleTasks = append(scheduleTasks, *scheduleTask)
	}

	return scheduleTasks, nil
}

func (adapter *ScheduleTaskAdapter) GetTaskBatchListByUserId(userId string) (response_dtos.ScheduleTaskBatchListResponseDTO, error) {
	listTaskBatchURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule/get-batch-task/" + userId
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

func (adapter *ScheduleTaskAdapter) ChooseTaskBatch(userId, batchNumber float64) (response_dtos.ScheduleTaskBatchListResponseDTO, error) {
	chooseTaskBatchURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule/choose-batch-task"
	headers := utils.BuildDefaultHeaders()

	request := request_dtos.NewChooseTaskBatchDTO()
	request.MapperToModel(userId, batchNumber)
	
	bodyResult, err := utils.BaseAPI(chooseTaskBatchURL, "POST", request, headers)
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

func (adapter *ScheduleTaskAdapter) CreateScheduleTask(request request_dtos.CreateScheduleGroupRequestDTO) (response_dtos.ScheduleGroupResponseDTO, error) {
	createScheduleTaskURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-group/create"
	headers := utils.BuildDefaultHeaders()

	bodyResult, err := utils.BaseAPI(createScheduleTaskURL, "POST", request, headers)
	if err != nil {
		return response_dtos.ScheduleGroupResponseDTO{}, err
	}

	data, err := json.Marshal(bodyResult)
	if err != nil {
		return response_dtos.ScheduleGroupResponseDTO{}, err
	}

	var dto response_dtos.ScheduleGroupResponseDTO
	err = json.Unmarshal(data, &dto)
	if err != nil {
		return response_dtos.ScheduleGroupResponseDTO{}, err
	}

	return dto, nil
}

func (adapter *ScheduleTaskAdapter) GetScheduleListByUserId(userId string) ([]response_dtos.ScheduleResponseDTO, error) {
	listScheduleURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule/get-schedule-task-list/" + userId
	var schedules []response_dtos.ScheduleResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(listScheduleURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.ScheduleResponseDTO{}, err
	}

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.ScheduleResponseDTO{}, nil
	}
	scheduleList, exists := bodyResultMap["scheduleTasks"]
	if !exists || scheduleList == nil {
		return nil, nil
	}
	if taskList, ok := scheduleList.([]interface{}); ok && len(taskList) == 0 {
		return []response_dtos.ScheduleResponseDTO{}, nil
	}

	for _, scheduleElement := range bodyResultMap["scheduleTasks"].([]interface{}) {
		schedule := mapper_response.ReturnScheduleObjectMapper(scheduleElement.(map[string]interface{}))
		schedules = append(schedules, *schedule)
	}

	return schedules, nil
}
