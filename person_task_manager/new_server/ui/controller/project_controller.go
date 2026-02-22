package controller

import (
	"encoding/json"
	"log"
	"net/http"
	base_dtos "personal_task_manager/core/domain/dtos/base"
	"personal_task_manager/core/domain/dtos/request"
	"personal_task_manager/core/usecase"

	"github.com/go-chi/chi"
)

func CreateProject(w http.ResponseWriter, r *http.Request, usecase *usecase.ProjectUsecase) {
	var projectRequest request.CreateProjectRequest
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

	response := base_dtos.ErrorResponse{
		Status:        "Success",
		StatusMessage: "Success",
		ErrorCode:     200,
		ErrorMessage:  "Chat dialogues retrieved successfully",
		Data:         map[string]interface{}{"projects": result},
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
