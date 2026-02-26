package usecase

import (
	"context"
	"database/sql"
	base_dtos "personal_task_manager/core/domain/dtos/base"
	"personal_task_manager/core/domain/dtos/mapper"
	"personal_task_manager/core/domain/dtos/request"
	"personal_task_manager/core/domain/dtos/response"
	"personal_task_manager/core/domain/entities"
	"personal_task_manager/core/service"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type ProjectUsecase struct {
	db *sql.DB

	projectService *service.ProjectService
	groupTaskService *service.GroupTaskService
}

func NewProjectUsecase(db *sql.DB) *ProjectUsecase {
	return &ProjectUsecase{
		db:             db,
		projectService: service.NewProjectService(db),
		groupTaskService: service.NewGroupTaskService(db),
	}
}

func (pu *ProjectUsecase) CreateProject(ctx context.Context, project request.CreateProjectRequest) (base_dtos.ErrorResponse, error) {
	if project.Color == "" {
		project.Color = "indigo"
	}
	if project.ActiveStatus == "" {
		project.ActiveStatus = "ACTIVE"
	}
	if project.Tags == nil || len(project.Tags) == 0 {
		project.Tags = []string{}
	}

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
		Tag:          project.Tags,
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

func (pu *ProjectUsecase) GetProjectWithGroupTasks(ctx context.Context, userId string) (base_dtos.ErrorResponse, error) {
	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		return base_dtos.ErrorResponse{}, err
	}	
	projects, err := pu.projectService.GetAllProjectsByUserID(ctx, userIdInt)
	if err != nil {
		return base_dtos.ErrorResponse{}, err
	}
	projectsContextResponse := make([]response.ProjectContextResponse, len(projects))
	for i, project := range projects {
		projectsContextResponse[i] = *mapper.MapProjectEntityToProjectContextResponse(&project)
	}


	for i, project := range projectsContextResponse {
		groupTasks, err := pu.groupTaskService.GetAllGroupTasksInProject(ctx, project.ID)
		if err != nil {
			return base_dtos.ErrorResponse{}, err
		}
		groupTaskContextResponse := make([]response.GroupTaskContextResponse, len(groupTasks))
		for j, groupTask := range groupTasks {
			groupTaskContextResponse[j] = *mapper.MapGroupTaskEntityToGroupTaskResponse(&groupTask)
		}
		projectsContextResponse[i].GroupTasks = groupTaskContextResponse
	}

	response := base_dtos.NewSuccessResponse(
		"Projects with group tasks retrieved successfully",
		map[string]interface{}{"projects": projectsContextResponse},
	)
	return response, nil
}
