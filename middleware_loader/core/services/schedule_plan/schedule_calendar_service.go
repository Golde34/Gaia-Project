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

func (s *ScheduleCalendarService) GetTimeBubbleConfig(userId string) (response_dtos.TimeBubbleConfigDTO, error) {
	dailyTasks, err := client.IScheduleCalendarAdapter(&adapter.ScheduleCalendarAdapter{}).GetTimeBubbleConfig(userId)
	if err != nil {
		return response_dtos.TimeBubbleConfigDTO{}, err
	}
	return dailyTasks, nil
}

func (s *ScheduleCalendarService) GetUserDailyTasks(userId string) (response_dtos.DailyTasksResponseDTO, error) {
	dailyTasks, err := client.IScheduleCalendarAdapter(&adapter.ScheduleCalendarAdapter{}).GetUserDailyTasks(userId)
	if err != nil {
		return response_dtos.DailyTasksResponseDTO{}, err
	}
	return dailyTasks, nil
}

func (s *ScheduleCalendarService) RegisterScheduleCalendar(userId string, scheduleCalendar map[string]interface{}) (response_dtos.RegisteredCalendarStatusResponseDTO, error) {
	registeredCalendarStatus, err := client.IScheduleCalendarAdapter(&adapter.ScheduleCalendarAdapter{}).RegisterScheduleCalendar(userId, scheduleCalendar)
	if err != nil {
		return response_dtos.RegisteredCalendarStatusResponseDTO{}, err
	}
	return registeredCalendarStatus, nil
}