package controller_services

import (
	"encoding/json"
	"fmt"
	"log"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	"middleware_loader/core/services/middleware_loader"
	"middleware_loader/kernel/utils"
	"net/http"
)

func CheckMicroservice(w http.ResponseWriter, r *http.Request, miccroserviceConfigService *services.MicroserviceConfigurationService) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var input = mapper.GetMicroserviceRequestDTOMapper(body)
	result, err := miccroserviceConfigService.CheckMicroserviceStatus(input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	dataBytes, err := json.Marshal(result)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(dataBytes)
}

func GetAllMicroservices(w http.ResponseWriter, r *http.Request, miccroserviceConfigService *services.MicroserviceConfigurationService) {
	result, err := miccroserviceConfigService.GetAllMicroservices()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := utils.ReturnSuccessResponse("Get all microservices successfully", result)

	dataBytes, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(dataBytes)
}

func GetMicroservice(w http.ResponseWriter, r *http.Request, miccroserviceConfigService *services.MicroserviceConfigurationService) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var input = mapper.MicroserviceConfigurationRequestDTOMapper(body)
	err := miccroserviceConfigService.GetMicroservice(input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func InsertMicroserviceConfiguration(w http.ResponseWriter, r *http.Request, miccroserviceConfigService *services.MicroserviceConfigurationService) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var input = mapper.InsertMicroserviceConfigurationRequestDTOMapper(body)
	result := miccroserviceConfigService.InsertMicroservice(input)
	dataBytes, err := json.Marshal(result)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Write(dataBytes)
}

func GetGaiaScreens(w http.ResponseWriter, r *http.Request, screenConfigurationService *services.ScreenConfigurationService) {
	result, err := screenConfigurationService.GetGaiaScreens()	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func InsertScreenConfiguration(w http.ResponseWriter, r *http.Request, screenConfigurationService *services.ScreenConfigurationService) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := screenConfigurationService.InsertScreen(body)	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func GetOnboarding(w http.ResponseWriter, r *http.Request, onboardingService *services.OnboardingService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	result, err := onboardingService.CheckUserOnboarding(userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}
