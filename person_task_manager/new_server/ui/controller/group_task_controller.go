package controller

import (
	"log"
	"net/http"
	"personal_task_manager/core/usecase"
	"personal_task_manager/kernel/utils"

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

	utils.BuildResponse(w, result)
}

func GetGroupTaskByTitle(w http.ResponseWriter, r *http.Request, usecase *usecase.GroupTaskUsecase) {
	title := chi.URLParam(r, "title")
	result, err := usecase.GetGroupTaskByTitle(r.Context(), title)
	if err != nil {
		log.Printf("Error retrieving group task by title: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.BuildResponse(w, result)
}
