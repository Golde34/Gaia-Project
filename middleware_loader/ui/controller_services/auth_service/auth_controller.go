package controller_services

import (
	"encoding/json"
	"fmt"
	"log"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	"middleware_loader/core/services/auth_services"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"
)

func Signin(w http.ResponseWriter, r *http.Request, authService *services.AuthService) {
	var body map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var input = authService.SigninInput
	input = mapper.SigninRequestDTOMapper(body)
	inputModel := model.SigninInput{
		Username: input.Username,
		Password: input.Password,
	}
	result, token, err := authService.Signin(r.Context(), inputModel)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	setTokenCookie(w, token.AccessToken, token.RefreshToken)

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"message":  "Login successfully",
		"userInfo": result,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func setTokenCookie(w http.ResponseWriter, accessToken, refreshToken string) {
	accessTokenCookie := &http.Cookie{
		Name:     "accessToken",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		// Secure:   true, // Must be HTTPS if using Secure
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60, // 15 minutes
	}
	http.SetCookie(w, accessTokenCookie)

	refreshTokenCookie := &http.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken,
		Path:     "/",
		HttpOnly: true,
		// Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   7 * 24 * 60 * 60, // 7 days
	}
	http.SetCookie(w, refreshTokenCookie)
}

func GaiaAutoSignin(w http.ResponseWriter, r *http.Request, authService *services.AuthService) {
	var input = authService.SigninInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := utils.GenerateGraphQLQueryWithInput("mutation", "gaiaAutoSignin", input, model.AuthTokenResponse{})
	utils.ConnectToGraphQLServer(w, query)
}

func Status(w http.ResponseWriter, r *http.Request, authService *services.AuthService) {
	query := utils.GenerateGraphQLQueryNoInput("query", "status", model.User{})
	utils.ConnectToGraphQLServer(w, query)
}

func RefreshToken(w http.ResponseWriter, r *http.Request, authService *services.AuthService) {
	cookie, err := r.Cookie("refreshToken")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}
	refreshToken := cookie.Value
	if refreshToken == "" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	newAccessToken, err := authService.RefreshToken(r.Context(), refreshToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	accessTokenCookie := &http.Cookie{
		Name:     "accessToken",
		Value:    newAccessToken,
		Path:     "/",
		HttpOnly: true,
		// Secure:   true, //
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60, // 15 minutes
	}
	http.SetCookie(w, accessTokenCookie)

	w.Header().Set("Content-Type", "application/json")
}

func GetServiceJWT(w http.ResponseWriter, r *http.Request, authService *services.AuthService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	serviceName := body["service"].(string)

	jwt, err := authService.GetServiceJWT(r.Context(), serviceName, userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{
		"message": "Get JWT successfully",
		"jwt":     jwt,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

}
