package controller_services

import (
	"encoding/json"
	"fmt"
	"middleware_loader/core/middleware"
	services "middleware_loader/core/services/schedule_plan"
	"net/http"
)

func GetUserDailyTasks(w http.ResponseWriter, r *http.Request, scheduleCalendarService *services.ScheduleCalendarService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	dailyTasks, err := scheduleCalendarService.GetUserDailyTasks(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Write the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dailyTasks)
}