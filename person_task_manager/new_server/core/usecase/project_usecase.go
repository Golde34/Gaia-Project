package usecase

import (
	"database/sql"
	"personal_task_manager/core/domain/dtos/request"
	"personal_task_manager/core/domain/entities"
	"personal_task_manager/infrastructure/repository"
)

type ProjectUsecase struct {
	db *sql.DB

	projectRepo *repository.ProjectRepository
}

func NewProjectUsecase(db *sql.DB) *ProjectUsecase {
	return &ProjectUsecase{
		db: db,
	}
}

func (pu *ProjectUsecase) CreateProject(project request.CreateProjectRequest) (entities.ProjectEntity, error) {
	if project.Color == "" {
		project.Color = "indigo"
	}
	if project.ActiveStatus == "" {
		project.ActiveStatus = "active"
	}

	// Did I need default project logic here?

	newProject := entities.ProjectEntity{
		Name:         project.Name,
		Description:  project.Description,
		UserID:       project.UserID,
		Color:        project.Color,
		Status:       project.Status,
		ActiveStatus: project.ActiveStatus,
	}

	// replace by project service and cache later
	createdProject, err := pu.projectRepo.CreateProject(newProject)
	if err != nil {
		return entities.ProjectEntity{}, err
	}

	return createdProject, nil
}

func (pu *ProjectUsecase) GetProjectByID(id string) (map[string]string, error) {
	// Implement the logic to get a project by ID
	project := map[string]string{
		"id":          id,
		"name":        "Sample Project",
		"description": "This is a sample project description.",
	}
	return project, nil
}
