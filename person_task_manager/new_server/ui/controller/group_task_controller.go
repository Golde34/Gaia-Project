package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"personal_task_manager/core/usecase"

	"github.com/go-chi/chi"
)

func GetAllGroupTasksInProject(w http.ResponseWriter, r *http.Request, usecase *usecase.GroupTaskUsecase) {
	projectId := chi.URLParam(r, "projectId")
	result, err := usecase.GetAllGroupTasksInProject(r.Context(), projectId)
	if err != nil {
		log.Printf("Error retrieving group tasks: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}