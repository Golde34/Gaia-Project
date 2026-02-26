package mapper

import (
	"personal_task_manager/core/domain/dtos/response"
	"personal_task_manager/core/domain/entities"
	"personal_task_manager/kernel/utils"
)

func MapProjectEntityToProjectContextResponse(project *entities.ProjectEntity) *response.ProjectContextResponse {
	return &response.ProjectContextResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
		Status:      project.Status,
		UserID:      project.UserID,
		Category:     utils.Join(project.Tag),
		ActiveStatus: project.ActiveStatus,
		CreatedAt:    project.CreatedAt,
		UpdatedAt:    project.UpdatedAt,
	}
}
