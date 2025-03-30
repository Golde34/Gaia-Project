package controller_services

import (
	"encoding/json"
	"log"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/schedule_plan"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"

	"github.com/go-chi/chi"
)

func GetScheduleTaskListByUserId(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	userId := chi.URLParam(r, "userId")
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
	userId := chi.URLParam(r, "userId")
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

	userId, batchNumber := mapper.ChooseTaskBatch(body)
		
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

	scheduleTaskDto := mapper.CreateScheduleGroupRequestDTOMapper(body)	
	
	scheduleGroup, err := services.NewScheduleTaskService().CreateScheduleGroup(scheduleTaskDto)
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

func GetScheduleListByUserId(w http.ResponseWriter, r *http.Request, scheduleTaskService *services.ScheduleTaskService) {
	userId := chi.URLParam(r, "userId")
	scheduleList, err := services.NewScheduleTaskService().GetScheduleListByUserId(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	scheduleTasks := map[string]interface{}{
		"scheduleTasks": scheduleList,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(scheduleTasks); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}