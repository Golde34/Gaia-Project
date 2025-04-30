package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
)

func CreateRoleRequestMapper(body map[string]interface{}) *request_dtos.CreateRoleRequestDTO {
	var input request_dtos.CreateRoleRequestDTO
	input.ID = utils.GetFloatValue(body, "id", 0)
	input.Name = utils.GetStringValue(body, "name", "")
	input.Description = utils.GetStringValue(body, "description", "")
	input.GrantedRank = utils.GetFloatValue(body, "grantedRank", 0)
	return &input
}