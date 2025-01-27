package controller_services

import (
	"encoding/json"
	"log"
	base_dtos "middleware_loader/core/domain/dtos/base"
	services "middleware_loader/core/services/contribution_tracker"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"

	"github.com/go-chi/chi"
)

func GetUserGithubInfo(w http.ResponseWriter, r *http.Request, userGithubService *services.UserGithubService) {
	userId := chi.URLParam(r, "userId")
	userGithubInfo, err := userGithubService.GetUserGithubInfo(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(userGithubInfo); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func GithubAuthorize(w http.ResponseWriter, r *http.Request, userGithubService *services.UserGithubService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	code := body["code"].(string)
	state := body["state"].(string)

	userGithubInfo, err := userGithubService.GithubAuthorize(code, state)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(userGithubInfo); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func SynchronizeUserGithub(w http.ResponseWriter, r *http.Request, userGithubService *services.UserGithubService) {
	userId := chi.URLParam(r, "userId")
	userGithubInfo, err := userGithubService.SynchronizeUserGithub(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(userGithubInfo); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func GetProjectsAndRepos(w http.ResponseWriter, r *http.Request, userGithubService *services.UserGithubService) {
	userId := chi.URLParam(r, "userId")
	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "listAllProjectsByUserId", QueryInput: model.IDInput{ID: userId}, QueryOutput: model.Project{}})
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "getAllGithubRepos", QueryInput: model.IDInput{ID: userId}, QueryOutput: model.GithubRepo{}})
	graphqlQuery := utils.GenerateGraphQLQueryWithMultipleFunction("query", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphqlQuery)

}

func SyncProjectRepo(w http.ResponseWriter, r *http.Request, userGithubService *services.UserGithubService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := body["userId"].(string)
	project := body["project"].(map[string]interface{})
	repo := body["repo"].(map[string]interface{})

	syncResult, err := userGithubService.SyncProjectRepo(userId, project, repo)
	
}