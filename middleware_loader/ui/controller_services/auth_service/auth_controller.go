package controller_services

import (
	"encoding/json"
	"log"
	mapper "middleware_loader/core/port/mapper/request"
	"middleware_loader/core/services/auth_services"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
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

	// Response JSON nếu cần (ví dụ chỉ gửi message)
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"message": "Login successfully",
		"userInfo": result,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// query := utils.GenerateGraphQLQueryWithInput("mutation", "signin", input, model.AuthTokenResponse{})	
	// utils.ConnectToGraphQLServer(w, query)
}

func setTokenCookie(w http.ResponseWriter, accessToken, refreshToken string) {
// SET COOKIE: Access Token
	accessTokenCookie := &http.Cookie{
		Name:     "accessToken",
		Value:    accessToken, // lấy từ AuthTokenResponse
		Path:     "/",
		HttpOnly: true,
		// Secure:   true, // Bắt buộc phải HTTPS nếu dùng Secure
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60, // 15 phút
	}
	http.SetCookie(w, accessTokenCookie)

	// SET COOKIE: Refresh Token
	refreshTokenCookie := &http.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken, // lấy từ AuthTokenResponse
		Path:     "/",
		HttpOnly: true,
		// Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   7 * 24 * 60 * 60, // 7 ngày
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

	result, token, err := authService.RefreshToken(r.Context(), refreshToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	setTokenCookie(w, token.AccessToken, token.RefreshToken)	

	// Response JSON nếu cần (ví dụ chỉ gửi message)
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"message": "Refresh token successfully",
		"userInfo": result,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

