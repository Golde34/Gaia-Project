package services

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/port/client"
	adapter "middleware_loader/infrastructure/client"
)

type ScheduleGroupService struct{}

func NewScheduleGroupService() *ScheduleGroupService {
	return &ScheduleGroupService{}
}

func (s *ScheduleGroupService) CreateScheduleGroup(request request_dtos.CreateScheduleGroupRequestDTO) (response_dtos.ScheduleGroupResponseDTO, error) {
	scheduleTask, err := client.IScheduleGroupAdapter(&adapter.ScheduleGroupAdapter{}).CreateScheduleGroup(request)
	if err != nil {
		return response_dtos.ScheduleGroupResponseDTO{}, err
	}
	return scheduleTask, nil
}

func (s *ScheduleGroupService) ListScheduleGroupByUserId(userId string) ([]response_dtos.ScheduleGroupResponseDTO, error) {
	scheduleTasks, err := client.IScheduleGroupAdapter(&adapter.ScheduleGroupAdapter{}).ListScheduleGroupByUserId(userId)
	if err != nil {
		return nil, err
	}
	return scheduleTasks, nil
}

func (s *ScheduleGroupService) DeleteScheduleGroup(scheduleGroupId string) (response_dtos.ScheduleGroupResponseDTO, error) {
	scheduleTask, err := client.IScheduleGroupAdapter(&adapter.ScheduleGroupAdapter{}).DeleteScheduleGroupById(scheduleGroupId)
	if err != nil {
		return response_dtos.ScheduleGroupResponseDTO{}, err
	}
	return scheduleTask, nil
} 