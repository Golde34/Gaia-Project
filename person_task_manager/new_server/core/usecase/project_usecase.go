package usecase

import (
	"context"
	"database/sql"
	base_dtos "personal_task_manager/core/domain/dtos/base"
	"personal_task_manager/core/domain/dtos/request"
	"personal_task_manager/core/domain/entities"
	"personal_task_manager/core/service"
	"strconv"
)

type ProjectUsecase struct {
	db *sql.DB

	projectService *service.ProjectService
}

func NewProjectUsecase(db *sql.DB) *ProjectUsecase {
	return &ProjectUsecase{
		db:             db,
		projectService: service.NewProjectService(db),
	}
}

func (pu *ProjectUsecase) CreateProject(ctx context.Context, project request.CreateProjectRequest) (entities.ProjectEntity, error) {
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
	createdProject, err := pu.projectService.CreateProject(ctx, newProject)
	if err != nil {
		return entities.ProjectEntity{}, err
	}

	return createdProject, nil
}

func (pu *ProjectUsecase) GetProjectByID(ctx context.Context, id string) (entities.ProjectEntity, error) {
	idInt, err := strconv.Atoi(id)
	if err != nil {
		return entities.ProjectEntity{}, err
	}
	return pu.projectService.GetProjectByID(ctx, idInt)	
}

func (pu *ProjectUsecase) GetAllProjectsByUserID(ctx context.Context, userId string) (base_dtos.ErrorResponse, error) {
	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		return base_dtos.ErrorResponse{}, err
	}
	projects, err := pu.projectService.GetAllProjectsByUserID(ctx, userIdInt)
	if err != nil {
		return base_dtos.ErrorResponse{}, err
	}
	response := base_dtos.ErrorResponse{
		Status:        "Success",
		StatusMessage: "Success",
		ErrorCode:     200,
		ErrorMessage:  "Projects retrieved successfully",
		Data:          map[string]interface{}{"projects": projects},
	}
	return response, nil
}