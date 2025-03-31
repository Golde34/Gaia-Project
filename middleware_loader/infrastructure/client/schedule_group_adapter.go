package client_adapter

import (
	"encoding/json"
	"log"
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	mapper_response "middleware_loader/core/port/mapper/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/kernel/utils"
)

type ScheduleGroupAdapter struct {}

func NewSchedulegroupAdapter() *ScheduleGroupAdapter {
	return &ScheduleGroupAdapter{}
}

func (adapter *ScheduleGroupAdapter) CreateScheduleGroup(request request_dtos.CreateScheduleGroupRequestDTO) (response_dtos.ScheduleGroupResponseDTO, error) {
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

func (adapter *ScheduleGroupAdapter) ListScheduleGroupByUserId(userId string) ([]response_dtos.ScheduleGroupResponseDTO, error) {
	listScheduleURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-group/list/" + userId
	var schedules []response_dtos.ScheduleGroupResponseDTO
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(listScheduleURL, "GET", nil, headers)
	if err != nil {
		return []response_dtos.ScheduleGroupResponseDTO{}, err
	}
	log.Println("ListScheduleGroupByUserId bodyResult: ", bodyResult)

	bodyResultMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return []response_dtos.ScheduleGroupResponseDTO{}, nil
	}
	scheduleList, exists := bodyResultMap["scheduleGroups"]
	if !exists || scheduleList == nil {
		return nil, nil
	}
	if taskList, ok := scheduleList.([]interface{}); ok && len(taskList) == 0 {
		return []response_dtos.ScheduleGroupResponseDTO{}, nil
	}

	for _, scheduleElement := range bodyResultMap["scheduleGroups"].([]interface{}) {
		schedule := mapper_response.ReturnScheduleObjectMapper(scheduleElement.(map[string]interface{}))
		schedules = append(schedules, *schedule)
	}

	return schedules, nil
}

func (adapter *ScheduleGroupAdapter) DeleteScheduleGroupById(scheduleGroupId string) (response_dtos.ScheduleGroupResponseDTO, error) {
	deleteScheduleGroupURL := base.SchedulePlanServiceURL + "/schedule-plan/schedule-group/delete/" + scheduleGroupId
	headers := utils.BuildDefaultHeaders()
	bodyResult, err := utils.BaseAPI(deleteScheduleGroupURL, "DELETE", nil, headers)
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