package controller_services

import (
	"encoding/json"
	"fmt"
	"log"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/schedule_plan"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"

	"github.com/go-chi/chi"
)

func GetScheduleTaskListByUserId(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	scheduleTaskList, err := services.NewScheduleTaskService().GetScheduleTaskListByUserId(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	response := map[string]interface{}{
		"scheduleTaskList": scheduleTaskList,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func GetTaskBatchListByUserId(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	taskBatchList, err := services.NewScheduleTaskService().GetTaskBatchListByUserId(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(taskBatchList); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func ChooseTaskBatch(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userIdStr := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	userId, batchNumber := mapper.ChooseTaskBatch(body, userIdStr)
		
	scheduleTaskBatch, err := services.NewScheduleTaskService().ChooseTaskBatch(userId, batchNumber)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(scheduleTaskBatch); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func CreateScheduleGroup(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	scheduleTaskDto := mapper.CreateScheduleGroupRequestDTOMapper(body, userId)	
	
	scheduleGroup, err := services.NewScheduleGroupService().CreateScheduleGroup(scheduleTaskDto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(scheduleGroup); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func ListScheduleGroupByUserId(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	scheduleList, err := services.NewScheduleGroupService().ListScheduleGroupByUserId(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	scheduleGroups := map[string]interface{}{
		"scheduleGroups": scheduleList,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(scheduleGroups); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func DeleteScheduleGroup(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	scheduleGroupId := chi.URLParam(r, "scheduleGroupId")
	scheduleGroup, err  := services.NewScheduleGroupService().DeleteScheduleGroup(scheduleGroupId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(scheduleGroup); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func GetActiveTaskBatch(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	scheduleTaskBatch, err := services.NewScheduleTaskService().GetActiveTaskBatch(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"activeTaskBatch": scheduleTaskBatch,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}