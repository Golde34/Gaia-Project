package controller_services

import (
	"encoding/json"
	"fmt"
	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/middleware"
	services "middleware_loader/core/services/notify_agent"
	"net/http"
)

func GetAllNotifications(w http.ResponseWriter, r *http.Request, notificationService *services.NotificationService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	notifications, err := notificationService.GetAllNotification(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := base_dtos.ErrorResponse{
		Status:        "success",
		StatusMessage: "Time bubble config retrieved successfully",
		ErrorCode:     200,
		ErrorMessage:  "Success",
		Data:          notifications,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}