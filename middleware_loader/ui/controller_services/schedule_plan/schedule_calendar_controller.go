package controller_services

import (
	"encoding/json"
	"fmt"
	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/middleware"
	services "middleware_loader/core/services/schedule_plan"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"
)

func GetTimeBubbleConfig(w http.ResponseWriter, r *http.Request, scheduleCalendarService *services.ScheduleCalendarService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	timeBubbleConfig, err := scheduleCalendarService.GetTimeBubbleConfig(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	timeBubbleMap := scheduleCalendarService.ReturnTimeBubbleMap(timeBubbleConfig)

	response := base_dtos.ErrorResponse{
		Status:        "success",
		StatusMessage: "Time bubble config retrieved successfully",
		ErrorCode:     200,
		ErrorMessage:  "Success",
		Data:          timeBubbleMap,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func RegisterScheduleCalendar(w http.ResponseWriter, r *http.Request, scheduleCalendarService *services.ScheduleCalendarService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	registeredCalendarStatus, err := scheduleCalendarService.RegisterScheduleCalendar(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(registeredCalendarStatus); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func GenerateDailyCalendar(w http.ResponseWriter, r *http.Request, scheduleCalendarService *services.ScheduleCalendarService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	generatedCalendarStatus, err := scheduleCalendarService.GenerateDailyCalendar(userId, body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(generatedCalendarStatus); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetUserDailyTasks(w http.ResponseWriter, r *http.Request, scheduleCalendarService *services.ScheduleCalendarService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	dailyTasks, err := scheduleCalendarService.GetUserDailyTasks(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(dailyTasks); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
