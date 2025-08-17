package client

import response_dtos "middleware_loader/core/domain/dtos/response"

type IScheduleCalendarAdapter interface {
	GetTimeBubbleConfig(userId string) ([]response_dtos.TimeBubbleConfigDTO, error)
	GetUserDailyTasks(userId string) (response_dtos.DailyTasksResponseDTO, error)
	RegisterScheduleCalendar(userId string) (response_dtos.RegisteredCalendarStatusResponseDTO, error)
	GenerateDailyCalendar(userId string) (map[string]interface{}, error)
}
