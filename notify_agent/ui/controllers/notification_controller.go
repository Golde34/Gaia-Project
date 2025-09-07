package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	base_dtos "notify_agent/core/domain/dtos/base"
	services "notify_agent/core/services/business"

	"github.com/go-chi/chi"
)

func GetAllNotificationsByUserId(w http.ResponseWriter, r *http.Request, notificationService *services.NotificationService) {
	userId := chi.URLParam(r, "userId")

	notifications, err := notificationService.GetAllNotifications(r.Context(), userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := base_dtos.ErrorResponse{
		Status:        "success",
		StatusMessage: "Get notifications successfully",
		ErrorCode:     200,
		ErrorMessage:  "Success",
		Data:          notifications,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}
