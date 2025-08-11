package controller_services

import (
	"encoding/json"
	"fmt"
	"middleware_loader/core/middleware"
	services "middleware_loader/core/services/schedule_plan"
	"net/http"
)

func GetTimeBubbleConfig(w http.ResponseWriter, r *http.Request, scheduleCalendarService *services.ScheduleCalendarService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	timeBubbleConfig, err := scheduleCalendarService.GetTimeBubbleConfig(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(timeBubbleConfig); err != nil {
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

func RegisterScheduleCalendar(w http.ResponseWriter, r *http.Request, scheduleCalendarService *services.ScheduleCalendarService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	var scheduleCalendar = make(map[string]interface{})
	if err := json.NewDecoder(r.Body).Decode(&scheduleCalendar); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	registeredCalendarStatus, err := scheduleCalendarService.RegisterScheduleCalendar(userId, scheduleCalendar)
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