package controller_services

import (
	"fmt"
	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/task_manager"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"

	"github.com/go-chi/chi"
)

func ListAll(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.GetId(userId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "listAllProjectsByUserId", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("query", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)

}

func GetById(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	projectId := chi.URLParam(r, "id")
	input := mapper.GetId(projectId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "getProjectById", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("query", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func CreateProject(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	input := mapper.CreateProjectRequestDTOMapper(body)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "createProject", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)

}

func UpdateProject(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	projectId := chi.URLParam(r, "id")

	input := mapper.UpdateProjectRequestDTOMapper(body, projectId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "updateProject", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func DeleteProject(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	projectId := chi.URLParam(r, "id")
	input := mapper.GetId(projectId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "deleteProject", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func GetGroupTasksInProject(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	projectId := chi.URLParam(r, "id")

	input := mapper.GetId(projectId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "getGroupTasksInProject", QueryInput: input, QueryOutput: model.GroupTask{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("query", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func UpdateProjectName(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	projectId := chi.URLParam(r, "id")
	input := mapper.UpdateProjectNameRequestDTOMapper(body, projectId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "updateProjectName", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func UpdateProjectColor(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	projectId := chi.URLParam(r, "id")
	input := mapper.UpdateProjectColorRequestDTOMapper(body, projectId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "updateProjectColor", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func ArchiveProject(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	projectId := chi.URLParam(r, "id")
	input := mapper.GetId(projectId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "archiveProject", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func EnableProject(w http.ResponseWriter, r *http.Request, projectService *services.ProjectService) {
	projectId := chi.URLParam(r, "id")
	input := mapper.GetId(projectId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "enableProject", QueryInput: input, QueryOutput: model.Project{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}
