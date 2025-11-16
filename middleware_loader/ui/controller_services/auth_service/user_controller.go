package controller_services

import (
	"encoding/json"
	"fmt"
	"log"
	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/auth_services"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"
)

func GetAllUsers(w http.ResponseWriter, r *http.Request, userService *services.UserService) {

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "listAllUsers", QueryInput: nil, QueryOutput: model.ListAllUsers{}})
	graphqlQuery := utils.GenerateGraphQLMultipleFunctionNoInput("query", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

// func GetByUsername(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
// 	var body map[string]interface{}
// 	body, err := controller_utils.MappingBody(w, r)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusBadRequest)
// 		return
// 	}

// 	input := mapper.UserDTOMapper(body)
// 	graphQuery := utils.GenerateGraphQLQueryWithInput("query", "getUserByUsername", model.UserInput{Username: username}, model.User{})
// 	utils.ConnectToGraphQLServer(w, graphQuery)
// }

func UpdateUser(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.UpdateUserRequestDTOMapper(body, userId)
	log.Println(input)
	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "updateUser", QueryInput: input, QueryOutput: model.UpdateUser{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func GetUserDetail(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "getUserDetail", QueryInput: model.IDInput{ID: userId}, QueryOutput: model.UpdateUser{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("query", graphqlQueryModel)
	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func UpdateUserSetting(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.UpdateUserSettingRequestDTOMapper(body, userId)
	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "updateUserSetting", QueryInput: input, QueryOutput: model.UserSetting{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func GetAllModels(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
	allModels, err := services.NewUserService().GetAllModels()	
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	models := map[string]interface{}{
		"llmModels": allModels,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(models); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func UpdateUserModel(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.UpdateUserModelRequestDTOMapper(body, userId)
	updateUserModel, err := services.NewUserService().UpdateUserModel(input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(updateUserModel); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func GetUserModels(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
	allModels, err := services.NewUserService().GetAllModels()	
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	models := map[string]interface{}{
		"llmModels": allModels,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(models); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func UpsertUserModels(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.UpsertUserModelRequestDTOMapper(body, userId)
	updateUserModel, err := services.NewUserService().UpsertUserModels(input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(updateUserModel); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}
