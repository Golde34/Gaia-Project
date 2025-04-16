package client

import response_dtos "middleware_loader/core/domain/dtos/response"

type IScheduleTaskAdapter interface {
    GetScheduleTaskListByUserId(userId string) ([]response_dtos.ScheduleTaskResponseDTO, error)
    GetTaskBatchListByUserId(userId string) (response_dtos.ScheduleTaskBatchListResponseDTO, error) 
    ChooseTaskBatch(userId, batchNumber float64) (response_dtos.ScheduleTaskBatchListResponseDTO, error)
    GetScheduleTaskBatch(userId string) (response_dtos.ScheduleTaskBatchListResponseDTO, error) 
}