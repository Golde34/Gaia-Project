package services

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/port/client"
	adapter "middleware_loader/infrastructure/client"
)

type ScheduleTaskService struct {}

func NewScheduleTaskService() *ScheduleTaskService {
	return &ScheduleTaskService{}
}

func (s *ScheduleTaskService) GetScheduleTaskListByUserId(userId string) ([]response_dtos.ScheduleTaskResponseDTO, error) {
	scheduleTasks, err := client.IScheduleTaskAdapter(&adapter.ScheduleTaskAdapter{}).GetScheduleTaskListByUserId(userId)
	if err != nil {
		return nil, err
	}
	return scheduleTasks, nil
}

func (s *ScheduleTaskService) GetTaskBatchListByUserId(userId string) (response_dtos.ScheduleTaskBatchListResponseDTO, error) {
	taskBatches, err := client.IScheduleTaskAdapter(&adapter.ScheduleTaskAdapter{}).GetTaskBatchListByUserId(userId)
	if err != nil {
		return response_dtos.ScheduleTaskBatchListResponseDTO{}, err
	}
	return taskBatches, nil
}

func (s *ScheduleTaskService) ChooseTaskBatch(userId, batchNumber float64) (response_dtos.ScheduleTaskBatchListResponseDTO, error) {
	taskBatch, err := client.IScheduleTaskAdapter(&adapter.ScheduleTaskAdapter{}).ChooseTaskBatch(userId, batchNumber)
	if err != nil {
		return response_dtos.ScheduleTaskBatchListResponseDTO{}, err
	}
	return taskBatch, nil
}

func (s *ScheduleTaskService) CreateScheduleGroup(request request_dtos.CreateScheduleGroupRequestDTO) (response_dtos.ScheduleGroupResponseDTO, error) {
	scheduleTask, err := client.IScheduleTaskAdapter(&adapter.ScheduleTaskAdapter{}).CreateScheduleTask(request)
	if err != nil {
		return response_dtos.ScheduleGroupResponseDTO{}, err
	}
	return scheduleTask, nil
}

func (s *ScheduleTaskService) ListScheduleGroupByUserId(userId string) ([]response_dtos.ScheduleGroupResponseDTO, error) {
	scheduleTasks, err := client.IScheduleTaskAdapter(&adapter.ScheduleTaskAdapter{}).ListScheduleGroupByUserId(userId)
	if err != nil {
		return nil, err
	}
	return scheduleTasks, nil
}