package services

import (
	response_dtos "chat_hub/core/domain/dtos/response"
	"chat_hub/infrastructure/client"
	"fmt"
)

type SchedulePlanService struct {
	schedulePlanClient *client.SchedulePlanAdapter
}

func NewSchedulePlanService() *SchedulePlanService {
	return &SchedulePlanService{
		schedulePlanClient: client.NewSchedulePlanAdapter(),
	}
}

func (s *SchedulePlanService) ReturnTimeBubbleConfig(userId string, messageMapStr map[string]interface{}) (map[string]interface{}, error) {
	timeBubbleConfigArray, err := s.schedulePlanClient.GetTimeBubbleConfig(userId)
	if err != nil {
		return nil, err
	}
	if timeBubbleConfigArray == nil {
		return messageMapStr, nil
	}

	scheduleAny, ok := messageMapStr["schedule"]
	if !ok {
		return messageMapStr, nil
	}
	schedule, ok := scheduleAny.(map[string]interface{})
	if !ok {
		return messageMapStr, nil
	}

	grouped := make(map[int][]response_dtos.TimeBubbleConfigDTO)
	for _, cfg := range timeBubbleConfigArray {
		day := int(cfg.DayOfWeek)
		if day < 0 || day > 6 {
			continue
		}
		grouped[day] = append(grouped[day], cfg)
	}

	targetDays := []int{2, 3, 4, 5, 6}

	for _, day := range targetDays {
		dayKey := fmt.Sprintf("%d", day)

		v, exists := schedule[dayKey]
		if exists {
			if arr, ok := v.([]interface{}); ok {
				if len(arr) > 0 {
					continue 
				}
				schedule[dayKey] = buildDayFromConfigs(grouped[day])
				continue
			}
			schedule[dayKey] = buildDayFromConfigs(grouped[day])
		} else {
			dayItems := buildDayFromConfigs(grouped[day])
			if len(dayItems) > 0 {
				schedule[dayKey] = dayItems
			}
		}
	}

	messageMapStr["schedule"] = schedule
	return messageMapStr, nil
}

func buildDayFromConfigs(cfgs []response_dtos.TimeBubbleConfigDTO) []interface{} {
	if len(cfgs) == 0 {
		return []interface{}{}
	}
	out := make([]interface{}, 0, len(cfgs))
	for _, c := range cfgs {
		item := map[string]interface{}{
			"start": c.StartTime,
			"end":   c.EndTime,
			"tag":   c.Tag,
		}
		out = append(out, item)
	}
	return out
}
