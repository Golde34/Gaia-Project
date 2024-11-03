package controller_services

import (
	"encoding/json"
	"log"
	base_dtos "middleware_loader/core/domain/dtos/base"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/auth_services"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"

	"github.com/go-chi/chi"
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

	input := mapper.UpdateUserRequestDTOMapper(body)
	log.Println(input)
	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "updateUser", QueryInput: input, QueryOutput: model.UpdateUser{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)
}

func GetUserDetail(w http.ResponseWriter, r *http.Request, userService *services.UserService) {
	id := chi.URLParam(r, "id")

	ctx := r.Context()
	user, err := userService.GetUserDetail(ctx, model.IDInput{ID: id})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}
