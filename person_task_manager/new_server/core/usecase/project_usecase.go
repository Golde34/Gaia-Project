package usecase

import (
	"context"
	"database/sql"
	"log"
	base_dtos "personal_task_manager/core/domain/dtos/base"
	"personal_task_manager/core/domain/dtos/request"
	"personal_task_manager/core/domain/entities"
	"personal_task_manager/core/service"
	"strconv"
	"time"

	"github.com/google/uuid"
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

func (pu *ProjectUsecase) CreateProject(ctx context.Context, project request.CreateProjectRequest) (base_dtos.ErrorResponse, error) {
	if project.Color == "" {
		project.Color = "indigo"
	}
	if project.ActiveStatus == "" {
		project.ActiveStatus = "ACTIVE"
	}
	log.Println("Creating project with name: ", project.Name, " for userId: ", project.UserID)

	// Did I need default project logic here?
	// tag is empty array for now, will implement later when I have tag feature

	newProject := entities.ProjectEntity{
		ID:           uuid.New().String(),
		Name:         project.Name,
		Description:  project.Description,
		Status:       project.Status,
		Color:        project.Color,
		UserID:       project.UserID,
		ActiveStatus: project.ActiveStatus,
		IsDefault:    false,
		Tag:          []string{},
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// replace by project service and cache later
	createdProject, err := pu.projectService.CreateProject(ctx, newProject)
	if err != nil {
		return base_dtos.NewErrorResponse(
			"Error",
			"Failed to create project",
			500,
			err.Error(),
			nil,
		), err
	}
	response := base_dtos.NewSuccessResponse(
		"Project created successfully",
		map[string]interface{}{"projects": createdProject},
	)
	return response, nil
}

func (pu *ProjectUsecase) GetProjectByID(ctx context.Context, id string) (base_dtos.ErrorResponse, error) {
	projects, err := pu.projectService.GetProjectByID(ctx, id)
	if err != nil {
		return base_dtos.NewErrorResponse(
			"Error",
			"Failed to retrieve project",
			500,
			err.Error(),
			nil,
		), err
	}
	response := base_dtos.NewSuccessResponse(
		"Project retrieved successfully",
		map[string]interface{}{"project": projects},
	)
	return response, nil
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

	response := base_dtos.NewSuccessResponse(
		"Projects retrieved successfully",
		map[string]interface{}{"projects": projects},
	)
	return response, nil
}
