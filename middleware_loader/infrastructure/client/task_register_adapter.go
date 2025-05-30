package client_adapter

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/domain/enums"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
)

var task_register_WO_domain = "/work-optimization"
var task_register_TM_domain = "/dashboard"
var task_register_SP_domain = "/schedule-plan"

type TaskRegisterAdapter struct {
	adapter *TaskRegisterAdapter
}

func NewTaskRegisterAdapter(adapter *TaskRegisterAdapter) *TaskRegisterAdapter {
	return &TaskRegisterAdapter{adapter: adapter}
}

func (adapter *TaskRegisterAdapter) RegisterTaskConfig(input model.RegisterTaskInput) (response_dtos.RegisterTaskConfigResponseDTO, error) {
	registerTaskConfigURL := base.WorkOptimizationServiceURL + task_register_WO_domain + "/register-task-config"
	var response response_dtos.RegisterTaskConfigResponseDTO
	headers := utils.BuildDefaultHeaders()
	_, err := utils.BaseAPIV2(registerTaskConfigURL, enums.POST, input, &response, headers)
	if err != nil {
		return response_dtos.RegisterTaskConfigResponseDTO{}, err
	}
	response.TaskConfigStatus = true
	return response, nil
}

func (adapter *TaskRegisterAdapter) IsTaskExisted(input model.UserIDInput) (response_dtos.IsTaskExistedResponseDTO, error) {
	isTaskExistedURL := base.TaskManagerServiceURL + task_register_TM_domain + "/check-existed-tasks"
	var response response_dtos.IsTaskExistedResponseDTO
	headers := utils.BuildDefaultHeaders()
	_, err := utils.BaseAPIV2(isTaskExistedURL, enums.GET, input, &response, headers)
	if err != nil {
		return response_dtos.IsTaskExistedResponseDTO{}, err
	}
	return response, nil
}

func (adapter *TaskRegisterAdapter) IsScheduleExisted(input model.UserIDInput) (response_dtos.IsScheduleExistedResponseDTO, error) {
	isScheduleExistedURL := base.SchedulePlanServiceURL + task_register_SP_domain + "/dashboard/check-existed-schedules"
	var response response_dtos.IsScheduleExistedResponseDTO
	headers := utils.BuildDefaultHeaders()
	_, err := utils.BaseAPIV2(isScheduleExistedURL, enums.GET, input, &response, headers)
	if err != nil {
		return response_dtos.IsScheduleExistedResponseDTO{}, err
	}
	return response, nil
}

func (adapter *TaskRegisterAdapter) QueryTaskConfig(input model.UserIDInput) (response_dtos.IsTaskConfigExistedResponseDTO, error) {
	queryTaskConfigURL := base.WorkOptimizationServiceURL + task_register_WO_domain + "/register-task-config"
	var response response_dtos.IsTaskConfigExistedResponseDTO
	headers := utils.BuildDefaultHeaders()
	_, err := utils.BaseAPIV2(queryTaskConfigURL, enums.GET, input, &response, headers)
	if err != nil {
		return response_dtos.IsTaskConfigExistedResponseDTO{}, err
	}
	return response, nil
}

func (adapter *TaskRegisterAdapter) RegisterSchedulePlan(input model.UserIDInput) (response_dtos.RegisterSchedulePlanResponseDTO, error) {
	registerSchedulePlanURL := base.SchedulePlanServiceURL + task_register_SP_domain + "/dashboard/register-schedule-plan"
	var response response_dtos.RegisterSchedulePlanResponseDTO
	headers := utils.BuildDefaultHeaders()
	_, err := utils.BaseAPIV2(registerSchedulePlanURL, enums.POST, input, &response, headers)
	if err != nil {
		return response_dtos.RegisterSchedulePlanResponseDTO{}, err
	}
	return response, nil
}