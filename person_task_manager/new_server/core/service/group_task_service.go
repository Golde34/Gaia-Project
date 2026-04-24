package service

import (
	"context"
	"database/sql"
	"personal_task_manager/core/domain/entities"
	"personal_task_manager/infrastructure/repository"
)

type GroupTaskService struct {
	db *sql.DB

	groupTaskRepo *repository.GroupTaskRepository
}

func NewGroupTaskService(db *sql.DB) *GroupTaskService {
	return &GroupTaskService{
		db:            db,
		groupTaskRepo: repository.NewGroupTaskRepository(db),
	}
}

func (gts *GroupTaskService) GetAllGroupTasksInProject(ctx context.Context, projectID string) ([]entities.GroupTaskEntity, error) {
	groupTasks, err := gts.groupTaskRepo.GetAllGroupTasksInProject(projectID)
	if err != nil {
		return nil, err
	}
	return groupTasks, nil
}
