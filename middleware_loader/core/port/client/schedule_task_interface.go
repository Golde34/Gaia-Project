package client

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
)

type IScheduleTaskAdapter interface {
    GetScheduleTaskListByUserId(userId string) ([]response_dtos.ScheduleTaskResponseDTO, error)
    GetTaskBatchListByUserId(userId string) (response_dtos.ScheduleTaskBatchListResponseDTO, error) 
    ChooseTaskBatch(userId, batchNumber float64) (response_dtos.ScheduleTaskBatchListResponseDTO, error)
    CreateScheduleTask(scheduleTask request_dtos.CreateScheduleGroupRequestDTO) (response_dtos.ScheduleGroupResponseDTO, error)
    ListScheduleGroupByUserId(userId string) ([]response_dtos.ScheduleGroupResponseDTO, error)
}