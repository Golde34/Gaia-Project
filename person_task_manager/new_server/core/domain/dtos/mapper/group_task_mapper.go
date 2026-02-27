package mapper

import (
	"personal_task_manager/core/domain/dtos/response"
	"personal_task_manager/core/domain/entities"
)

func MapGroupTaskEntityToGroupTaskResponse(groupTask *entities.GroupTaskEntity) *response.GroupTaskContextResponse {
	return &response.GroupTaskContextResponse{
		ID:          groupTask.ID,
		Title:       groupTask.Title,
		Description: groupTask.Description,
		ActiveStatus: groupTask.ActiveStatus,
		CreatedAt:   groupTask.CreatedAt,
		UpdatedAt:   groupTask.UpdatedAt,
	}
}
