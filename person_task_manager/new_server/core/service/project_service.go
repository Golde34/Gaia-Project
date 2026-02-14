package service

import (
	"database/sql"
	"personal_task_manager/core/domain/entities"
	"personal_task_manager/infrastructure/repository"
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


func (ps *ProjectService) CreateProject(project entities.ProjectEntity) (entities.ProjectEntity, error) {
	// Implement the logic to create a project using the repository
	createdProject, err := ps.projectRepo.CreateProject(project)
	if err != nil {
		return entities.ProjectEntity{}, err
	}
	return createdProject, nil
}
