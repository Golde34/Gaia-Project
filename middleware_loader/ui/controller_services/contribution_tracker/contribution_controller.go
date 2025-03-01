package controller_services

import (
	"encoding/json"
	"log"
	services "middleware_loader/core/services/contribution_tracker"
	"net/http"

	"github.com/go-chi/chi"
)

func GetUserContribution(w http.ResponseWriter, r *http.Request, contributionService *services.ContributionService) {
	userId := chi.URLParam(r, "userId")
	userContribution, err := contributionService.GetUserContribution(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(userContribution); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func CompareCommits(w http.ResponseWriter, r *http.Request, contributionService *services.ContributionService) {
	userId := chi.URLParam(r, "userId")
	compareCommits, err := contributionService.CompareCommits(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(compareCommits); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}