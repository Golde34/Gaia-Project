package services

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/port/client"
	adapter "middleware_loader/infrastructure/client"
)

type ScheduleCalendarService struct {}

func NewScheduleCalendarService() *ScheduleCalendarService {
	return &ScheduleCalendarService{}
}

func (s *ScheduleCalendarService) GetUserDailyTasks(userId string) ([]response_dtos.ScheduleTaskResponseDTO, error) {
	dailyTasks, err := client.IScheduleCalendarAdapter(&adapter.ScheduleCalendarAdapter{}).GetUserDailyTasks(userId)
	if err != nil {
		return nil, err
	}
	return dailyTasks, nil
}