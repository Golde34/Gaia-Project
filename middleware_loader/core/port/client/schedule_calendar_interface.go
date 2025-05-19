package client

import response_dtos "middleware_loader/core/domain/dtos/response"

type IScheduleCalendarAdapter interface {
	GetUserDailyTasks(userId string) (response_dtos.DailyTasksResponseDTO, error)
}