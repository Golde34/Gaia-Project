package controller_services

import (
	"encoding/json"
	"fmt"
	"log"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/work_optimization"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"
)

func OptimizeTaskByUser(w http.ResponseWriter, r *http.Request, taskOptimizationService *services.TaskOptimizationService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.OptimizeTaskByUserRequestDTOMapper(body, userId)

	result, err := taskOptimizationService.OptimizeTaskByUser(input)
	if err != nil {
		log.Printf("Error optimizing task: %v", err)
		http.Error(w, fmt.Sprintf("Failed to optimize tasks: %v", err), http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{
		"data": result,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, fmt.Sprintf("Error generating response: %v", err), http.StatusInternalServerError)
	}
}
