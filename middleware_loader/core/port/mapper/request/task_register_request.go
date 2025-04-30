package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
)

func RegisterTaskConfigRequestDTOMapper(body map[string]interface{}) *request_dtos.TaskRegisterConfigRequestDTO {
	var input request_dtos.TaskRegisterConfigRequestDTO
	input.UserId = utils.GetFloatValue(body, "userId", 0)
	input.SleepDuration = utils.GetFloatValue(body, "sleepDuration", 0)
	input.StartSleepTime = utils.GetStringValue(body, "startSleepTime", "")
	input.EndSleepTime = utils.GetStringValue(body, "endSleepTime", "")
	input.RelaxTime = utils.GetFloatValue(body, "relaxTime", 0)
	input.TravelTime = utils.GetFloatValue(body, "travelTime", 0)
	input.EatTime = utils.GetFloatValue(body, "eatTime", 0)
	input.WorkTime = utils.GetFloatValue(body, "workTime", 0)
	return &input
}
