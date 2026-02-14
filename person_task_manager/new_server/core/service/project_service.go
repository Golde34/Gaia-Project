package service

import (
	"context"
	"database/sql"
	"fmt"
	"personal_task_manager/core/domain/entities"
	redis_cache "personal_task_manager/infrastructure/cache"
	"personal_task_manager/infrastructure/repository"
	"time"
)

type ProjectService struct {
	db *sql.DB

	projectRepo *repository.ProjectRepository
}

func NewProjectService(db *sql.DB) *ProjectService {
	return &ProjectService{
		db:          db,
		projectRepo: repository.NewProjectRepository(db),
	}
}

func (ps *ProjectService) CreateProject(ctx context.Context, project entities.ProjectEntity) (entities.ProjectEntity, error) {
	createdProject, err := ps.projectRepo.CreateProject(project)
	if err != nil {
		return entities.ProjectEntity{}, err
	}

	cacheKey := fmt.Sprintf("project:%s", createdProject.ID)

	err = redis_cache.SetHybridLocal(ctx, cacheKey, createdProject, 10*time.Minute)
	if err != nil {
		return entities.ProjectEntity{}, err
	}

	return createdProject, nil
}

func (ps *ProjectService) GetProjectByID(ctx context.Context, id int) (entities.ProjectEntity, error) {
	cacheKey := fmt.Sprintf("project:%d", id)
	var project entities.ProjectEntity

	found, err := redis_cache.GetLocal(context.Background(), cacheKey, &project)
	if err == nil && found {
		return project, nil
	}

	project, err = ps.projectRepo.GetProjectByID(id)
	if err != nil {
		return entities.ProjectEntity{}, err
	}

	_ = redis_cache.SetHybridLocal(context.Background(), cacheKey, project, 10*time.Minute)

	return project, nil
}

func (ps *ProjectService) GetAllProjectsByUserID(ctx context.Context, userId int) ([]entities.ProjectEntity, error) {
	projects, err := ps.projectRepo.GetAllProjectsByUserID(userId)
	if err != nil {
		return nil, err
	}

	go func() {
		for _, project := range projects {
			cacheKey := fmt.Sprintf("project:%s", project.ID)
			_ = redis_cache.SetHybridLocal(context.Background(), cacheKey, project, 10*time.Minute)
		}	
	}()
	
	return projects, nil
}
