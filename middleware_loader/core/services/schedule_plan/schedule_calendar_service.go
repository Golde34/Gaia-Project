package services

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/port/client"
	adapter "middleware_loader/infrastructure/client"
	"strconv"
)

type ScheduleCalendarService struct {}

func NewScheduleCalendarService() *ScheduleCalendarService {
	return &ScheduleCalendarService{}
}

func (s *ScheduleCalendarService) GetTimeBubbleConfig(userId string) ([]response_dtos.TimeBubbleConfigDTO, error) {
	dailyTasks, err := client.IScheduleCalendarAdapter(&adapter.ScheduleCalendarAdapter{}).GetTimeBubbleConfig(userId)
	if err != nil {
		return []response_dtos.TimeBubbleConfigDTO{}, err
	}
	return dailyTasks, nil
}

func (s *ScheduleCalendarService) ReturnTimeBubbleMap(timeBubbleConfigs []response_dtos.TimeBubbleConfigDTO,) map[string]interface{} {
    schedule := make(map[string][]map[string]string)
    for i := 0; i < 7; i++ {
        schedule[strconv.Itoa(i)] = []map[string]string{}
    }

    for _, cfg := range timeBubbleConfigs {
        dayKey := strconv.Itoa(int(cfg.DayOfWeek)) // float64 -> int
        item := map[string]string{
            "start": cfg.StartTime,
            "end":   cfg.EndTime,
            "tag":   cfg.Tag,
        }
        schedule[dayKey] = append(schedule[dayKey], item)
    }

    return map[string]interface{}{
        "schedule": schedule,
    }
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