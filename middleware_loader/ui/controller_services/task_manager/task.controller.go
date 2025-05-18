package controller_services

import (
	"encoding/json"
	"fmt"
	"log"
	base_dtos "middleware_loader/core/domain/dtos/base"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/task_manager"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"

	"github.com/go-chi/chi"
)

func ListAllTasks(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "listAllTasks", QueryInput: nil, QueryOutput: model.Task{}})
	graphqlQuery := utils.GenerateGraphQLMultipleFunctionNoInput("query", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func GetTaskById(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	taskId := chi.URLParam(r, "id")
	input := mapper.GetTaskId(taskId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "getTaskById", QueryInput: input, QueryOutput: model.Task{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("query", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func CreateTask(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.CreateTaskRequestDTOMapper(body, userId)

	query := utils.GenerateGraphQLQueryWithInput("mutation", "createTask", input, model.Task{})
	utils.ConnectToGraphQLServer(w, query)
}

func UpdateTask(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	taskId := chi.URLParam(r, "id")
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.UpdateTaskRequestDTOMapper(body, taskId, userId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "updateTask", QueryInput: input, QueryOutput: model.Task{}})
	graphQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphQuery)
}

func DeleteTask(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	taskId := chi.URLParam(r, "id")
	input := mapper.GetTaskId(taskId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "deleteTask", QueryInput: input, QueryOutput: model.Task{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func GetSubTasksByTaskId(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	log.Println("GetSubTasksByTaskId")
}

func GetCommentsByTaskId(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	log.Println("GetCommentsByTaskId")
}

func GenerateTaskWithoutGroupTask(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.GenerateTaskRequestDTOMapper(body, userId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "generateTaskWithoutGroupTask", QueryInput: input, QueryOutput: model.Task{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func UpdateTaskInDialog(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	taskId := chi.URLParam(r, "id")

	input := mapper.UpdateTaskInDialogRequestDTOMapper(body, taskId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "updateTaskInDialog", QueryInput: input, QueryOutput: model.Task{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func MoveTask(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	taskId := chi.URLParam(r, "id")

	input := mapper.MoveTaskRequestDTOMapper(body, taskId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "moveTask", QueryInput: input, QueryOutput: model.Task{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func ArchiveTask(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	taskId := chi.URLParam(r, "id")
	input := mapper.GetTaskId(taskId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "archiveTask", QueryInput: input, QueryOutput: model.Task{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func Enable(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	taskId := chi.URLParam(r, "id")
	input := mapper.GetTaskId(taskId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "enableTask", QueryInput: input, QueryOutput: model.Task{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func GetTaskDetail(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.GetTaskDetailRequestDTOMapper(body, userId)

	taskDetail, err := services.NewTaskService().GetTaskDetail(input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"data": taskDetail,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func ListDoneTasks(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	doneTasks, err := services.NewTaskService().GetDoneTasks(userId)	
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	response := map[string]interface{}{
		"data": doneTasks,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func ListTopTasks(w http.ResponseWriter, r *http.Request, taskService *services.TaskService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	topTasks, err := services.NewTaskService().GetTopTasks(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if len(topTasks) == 0  || topTasks == nil {
		topTasks = []response_dtos.TopTaskResponse{}
	}
	response := map[string]interface{}{
		"data": topTasks,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}