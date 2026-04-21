package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"personal_task_manager/core/domain/dtos/request"
	"personal_task_manager/core/usecase"
	"personal_task_manager/kernel/utils"

	"github.com/go-chi/chi"
)

func CreateProject(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	var projectRequest request.ProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&projectRequest); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := usecase.CreateProject(r.Context(), projectRequest)
	if err != nil {
		log.Printf("Error creating project: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.BuildResponse(w, result)
}

func GetProject(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	projectId := chi.URLParam(r, "id")
	result, err := usecase.GetProjectByID(r.Context(), projectId)
	if err != nil {
		log.Printf("Error retrieving project: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.BuildResponse(w, result)
}

func GetAllProject(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	userId := chi.URLParam(r, "userId")
	log.Print("UserId: ", userId)
	result, err := usecase.GetAllProjectsByUserID(r.Context(), userId)
	if err != nil {
		log.Printf("Error retrieving projects: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.BuildResponse(w, result)
}

func GetProjectWithGroupTasks(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	userId := chi.URLParam(r, "userId")
	result, err := usecase.GetProjectWithGroupTasks(r.Context(), userId)
	if err != nil {
		log.Printf("Error retrieving project with group tasks: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.BuildResponse(w, result)
}

func UpdateProject(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	projectId := chi.URLParam(r, "id")
	var projectRequest request.ProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&projectRequest); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := usecase.UpdateProject(r.Context(), projectId, projectRequest)
	if err != nil {
		log.Printf("Error updating project: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.BuildResponse(w, result)
}

func DeleteProject(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	projectId := chi.URLParam(r, "id")
	_, err := usecase.DeleteProject(r.Context(), projectId)
	if err != nil {
		log.Printf("Error deleting project: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func UpdateProjectName(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	projectId := chi.URLParam(r, "id")
	var projectRequest request.ProjectNameRequest
	if err := json.NewDecoder(r.Body).Decode(&projectRequest); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := usecase.UpdateProjectName(r.Context(), projectId, projectRequest)
	if err != nil {
		log.Printf("Error updating project: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.BuildResponse(w, result)	
}