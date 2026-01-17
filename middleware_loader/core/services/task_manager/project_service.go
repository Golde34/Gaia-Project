package services

import (
	"context"
	"fmt"
	"log"
	"strconv"
	converter_dtos "middleware_loader/core/domain/dtos/converter"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/domain/enums"
	"middleware_loader/core/port/client"
	middleware_services "middleware_loader/core/services/middleware_loader"
	"middleware_loader/core/validator"
	adapter "middleware_loader/infrastructure/client"
	"middleware_loader/infrastructure/graph/model"
	database_mongo "middleware_loader/kernel/database/mongo"
	"middleware_loader/kernel/configs"
)

type ProjectService struct {
	quotaService *middleware_services.UserApiQuotaService
}

func NewProjectService(db database_mongo.Database) *ProjectService {
	quotaService := middleware_services.NewUserApiQuotaService(db)
	service := &ProjectService{
		quotaService: quotaService,
	}
	quotaService.RegisterActionHandler(enums.SYNC_PROJECT_ACTION, service.handleSyncProjectAction)
	return service
}

var projectValidation = validator.NewProjectDTOValidator()
var projectResponse = response_dtos.NewCreateProjectResponseDTO()
var groupTaskResponse = response_dtos.NewGroupTaskResponseDTO()

func (s *ProjectService) ListAll(ctx context.Context) ([]model.Project, error) {
	projects, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).ListAll()
	if err != nil {
		return nil, err
	}
	projectsModel := projectResponse.MapperListToGraphQLModel(projects)

	return projectsModel, nil
}

func (s *ProjectService) ListAllByUserID(ctx context.Context, input model.IDInput) ([]model.Project, error) {
	projects, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).ListAllByUserID(input.ID)
	if err != nil {
		return nil, err
	}
	projectsModel := projectResponse.MapperListToGraphQLModel(projects)

	return projectsModel, nil
}

func (s *ProjectService) GetById(ctx context.Context, id string) (model.Project, error) {
	project, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).GetById(id)
	if err != nil {
		return model.Project{}, err
	} else {
		projectModel := projectResponse.MapperToGraphQLModel(project)
		return projectModel, nil
	}
}

func (s *ProjectService) CreateProject(ctx context.Context, input model.CreateProjectInput) (model.Project, error) {
	err := projectValidation.CreateProjectValidate(input)
	if err != nil {
		return model.Project{}, err
	}
	log.Println("Validation passed!")

	project, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).CreateProject(input)
	if err != nil {
		return model.Project{}, err
	} else {
		projectModel := projectResponse.MapperToGraphQLModel(project)
		return projectModel, nil
	}
}

func (s *ProjectService) UpdateProject(ctx context.Context, input model.UpdateProjectInput) (model.Project, error) {
	err := projectValidation.UpdateProjectValidate(input)
	if err != nil {
		return model.Project{}, err
	}
	log.Println("Validation passed!")

	projectId := input.ProjectID
	project, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).UpdateProject(input, projectId)
	if err != nil {
		return model.Project{}, err
	} else {
		projectModel := projectResponse.MapperToGraphQLModel(project)
		return projectModel, nil
	}
}

func (s *ProjectService) DeleteProject(ctx context.Context, input model.IDInput) (model.Project, error) {
	project, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).DeleteProject(input.ID)
	if err != nil {
		return model.Project{}, err
	} else {
		projectModel := projectResponse.MapperToGraphQLModel(project)
		return projectModel, nil
	}
}

func (s *ProjectService) UpdateProjectName(ctx context.Context, input model.UpdateObjectNameInput) (model.Project, error) {
	err := projectValidation.UpdateProjectNameValidate(input)
	if err != nil {
		return model.Project{}, err
	}
	log.Println("Validation passed!")

	projectId := input.ID
	projectRequestModel := converter_dtos.UpdateNameConverterDTO{
		Name: input.Name,
	}
	project, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).UpdateProjectName(projectRequestModel, projectId)
	if err != nil {
		return model.Project{}, err
	} else {
		projectModel := projectResponse.MapperToGraphQLModel(project)
		return projectModel, nil
	}
}

func (s *ProjectService) UpdateProjectColor(ctx context.Context, input model.UpdateColorInput) (model.Project, error) {
	err := projectValidation.UpdateProjectColorValidate(input)
	if err != nil {
		return model.Project{}, err
	}
	log.Println("Validation passed!")

	projectId := input.ID
	projectRequestModel := converter_dtos.UpdateColorConverterDTO{
		Color: input.Color,
	}
	project, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).UpdateProjectColor(projectRequestModel, projectId)
	if err != nil {
		return model.Project{}, err
	} else {
		projectModel := projectResponse.MapperToGraphQLModel(project)
		return projectModel, nil
	}
}

func (s *ProjectService) GetGroupTasksInProject(ctx context.Context, id string) ([]model.GroupTask, error) {
	groupTasks, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).GetGroupTasksInProject(id)
	if err != nil {
		return nil, err
	}
	groupTasksModel := groupTaskResponse.MapperListToGraphQLModel(groupTasks)

	return groupTasksModel, nil
}

func (s *ProjectService) ArchiveProject(ctx context.Context, input model.IDInput) (model.Project, error) {
	project, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).ArchiveProject(input.ID)
	if err != nil {
		return model.Project{}, err
	} else {
		projectModel := projectResponse.MapperToGraphQLModel(project)
		return projectModel, nil
	}
}

func (s *ProjectService) EnableProject(ctx context.Context, input model.IDInput) (model.Project, error) {
	project, err := client.IProjectAdapter(&adapter.ProjectAdapter{}).EnableProject(input.ID)
	if err != nil {
		return model.Project{}, err
	} else {
		projectModel := projectResponse.MapperToGraphQLModel(project)
		return projectModel, nil
	}
}

func (s *ProjectService) SyncProjectMemory(ctx context.Context, userId string) (interface{}, error) {
	config := configs.Config{}
	cfg, _ := config.LoadEnv()
	maxQuotaStr := cfg.SyncProjectQuota
	maxQuota, err := strconv.Atoi(maxQuotaStr)
	if err != nil {
		maxQuota = 1
	}

	remaining, err := s.quotaService.CheckAndDecreaseQuota(
		ctx,
		userId,
		enums.SYNC_PROJECT_ACTION,
		maxQuota,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("quota exceeded: maximum %d sync requests per day", maxQuota)
	}

	return map[string]interface{}{
		"message":   "Sync project request accepted for processing",
		"status":    "accepted",
		"remaining": remaining,
		"userId":    userId,
	}, nil
}

// handleSyncProjectAction is the callback handler that executes when sync_project is triggered
// This function runs asynchronously after quota is decreased
func (s *ProjectService) handleSyncProjectAction(
	ctx context.Context,
	userId string,
	actionType string,
	payload map[string]interface{},
) error {
	log.Printf("🚀 Starting sync project for user=%s", userId)
	return nil
}
