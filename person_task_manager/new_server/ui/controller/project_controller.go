package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"personal_task_manager/core/domain/dtos/request"
	"personal_task_manager/core/usecase"

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

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func GetProject(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	projectId := chi.URLParam(r, "id")
	result, err := usecase.GetProjectByID(r.Context(), projectId)
	if err != nil {
		log.Printf("Error retrieving project: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
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

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func GetProjectWithGroupTasks(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	userId := chi.URLParam(r, "userId")
	result, err := usecase.GetProjectWithGroupTasks(r.Context(), userId)
	if err != nil {
		log.Printf("Error retrieving project with group tasks: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
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

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
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
