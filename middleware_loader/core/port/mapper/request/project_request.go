package mapper

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
)

func GetId(id string) *request_dtos.IdInputDTO {
	var input request_dtos.IdInputDTO
	input.Id = id
	return &input
}

func CreateProjectRequestDTOMapper(body map[string]interface{}) *request_dtos.CreateProjectRequestDTO {
	var input request_dtos.CreateProjectRequestDTO
	input.Name = utils.GetStringValue(body, "name", "")
	input.Description = utils.GetStringValue(body, "description", "")
	input.Status = utils.GetStringValue(body, "status", "")
	input.Color = utils.GetStringValue(body, "color", "")
	input.OwnerId = utils.GetStringValue(body, "ownerId", "")
	input.ActiveStatus = utils.GetStringValue(body, "activeStatus", "")

	return &input
}

func UpdateProjectRequestDTOMapper(body map[string]interface{}, projectId string) *request_dtos.UpdateProjectRequestDTO {
	var input request_dtos.UpdateProjectRequestDTO
	input.Name = body["name"].(string)
	input.Description = body["description"].(string)
	input.Status = body["status"].(string)
	input.Color = body["color"].(string)
	input.Owner = body["owner"].(string)
	input.ActiveStatus = body["activeStatus"].(string)
	input.ProjectId = projectId

	return &input
}

func UpdateProjectNameRequestDTOMapper(body map[string]interface{}, projectId string) *request_dtos.UpdateProjectNameInputDTO {
	var input request_dtos.UpdateProjectNameInputDTO
	input.Name = body["newName"].(string)
	input.ID = projectId

	return &input
}

func UpdateProjectColorRequestDTOMapper(body map[string]interface{}, projectId string) *request_dtos.UpdateProjectColorInputDTO {
	var input request_dtos.UpdateProjectColorInputDTO
	input.Color = body["color"].(string)
	input.ID = projectId

	return &input
}
