package client

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
)

type IScheduleGroupAdapter interface {
	CreateScheduleGroup(scheduleTask request_dtos.CreateScheduleGroupRequestDTO) (response_dtos.ScheduleGroupResponseDTO, error)
	ListScheduleGroupByUserId(userId string) ([]response_dtos.ScheduleGroupResponseDTO, error)
	DeleteScheduleGroupById(scheduleGroupId string) (response_dtos.ScheduleGroupResponseDTO, error)
}
