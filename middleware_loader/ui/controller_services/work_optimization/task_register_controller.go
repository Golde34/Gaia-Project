package controller_services

import (
	"fmt"
	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/work_optimization"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"
)

func RegisterTaskConfig(w http.ResponseWriter, r *http.Request, taskRegisterService *services.TaskRegisterService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	registerTaskInput := mapper.RegisterTaskConfigRequestDTOMapper(body, userId)
	userInput := mapper.GetUserIdInBody(body)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "registerTaskConfig", QueryInput: registerTaskInput, QueryOutput: model.RegisterTaskConfig{}})
	// Check if task and schedule existed for introduction purpose
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "isTaskExisted", QueryInput: userInput, QueryOutput: model.IsTaskExisted{}})
	// graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "isScheduleExisted", QueryInput: userInput, QueryOutput: model.IsScheduleExisted{}})
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "registerSchedulePlan", QueryInput: userInput, QueryOutput: model.RegisterSchedulePlan{}})
	graphQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphQuery)
}

func QueryTaskConfig(w http.ResponseWriter, r *http.Request, taskRegisterService *services.TaskRegisterService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.GetUserId(userId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "queryTaskConfig", QueryInput: input, QueryOutput: model.IsTaskConfigExisted{}})
	// Check if task and schedule existed for introduction purpose
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "isTaskExisted", QueryInput: input, QueryOutput: model.IsTaskExisted{}})
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "isScheduleExisted", QueryInput: input, QueryOutput: model.IsScheduleExisted{}})
	graphQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphQuery)
}
