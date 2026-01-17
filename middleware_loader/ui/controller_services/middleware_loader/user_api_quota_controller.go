package controller_services

import (
	"encoding/json"
	"fmt"
	"log"
	"middleware_loader/core/middleware"
	services "middleware_loader/core/services/middleware_loader"
	"net/http"
)

func SyncProjectMemory(w http.ResponseWriter, r *http.Request, userApiQuotaService *services.UserApiQuotaService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))

	response, err := userApiQuotaService.SyncProjectMemory(r.Context(), userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}