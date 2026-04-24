package usecase

import (
	"context"
	"database/sql"
	base_dtos "personal_task_manager/core/domain/dtos/base"
	"personal_task_manager/core/service"
)

type GroupTaskUsecase struct {
	db *sql.DB

	groupTaskService *service.GroupTaskService
}

func NewGroupTaskUsecase(db *sql.DB) *GroupTaskUsecase {
	return &GroupTaskUsecase{
		db:               db,
		groupTaskService: service.NewGroupTaskService(db),
	}
}

func (gtu *GroupTaskUsecase) GetAllGroupTasksInProject(ctx context.Context, projectID string) (base_dtos.ErrorResponse, error) {
	result, err := gtu.groupTaskService.GetAllGroupTasksInProject(ctx, projectID)
	if err != nil {
		return base_dtos.NewErrorResponse(
			"Error",
			"Failed to get group tasks in project",
			500,
			err.Error(),
			nil,
		), nil
	}
	return base_dtos.NewSuccessResponse(
		"Group tasks retrieved successfully",
		result,
	), nil
}
