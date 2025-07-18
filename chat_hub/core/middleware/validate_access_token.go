package middleware

import (
	services "chat_hub/core/services/chat"
	"context"
	"log"
	"net/http"
	"strings"
)

type contextKey string

const (
	ContextKeyUserId = contextKey("user")
)

func ValidateAccessToken() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			noAuthRequired := []string{"/sign-in", "/gaia-auto-sign-in", "/sign-up", "/sign-out", "refresh-token", "/graphql-query"}

			for _, path := range noAuthRequired {
				if strings.Contains(r.URL.Path, path) {
					next.ServeHTTP(w, r)
					return
				}
			}

			validateRefreshToken := validateRefreshToken(r, w)
			if !validateRefreshToken {
				http.Error(w, "Unauthorized", http.StatusForbidden)
				return
			}

			accessToken, ctxWithUser := validateAccessToken(r, w)
			if accessToken == "" || ctxWithUser == nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// test without validate access token
			// ctxWithUser := context.WithValue(r.Context(), ContextKeyUserId, "1")

			next.ServeHTTP(w, r.WithContext(ctxWithUser))
		})
	}
}

func validateRefreshToken(r *http.Request, w http.ResponseWriter) bool {
	refreshCookie, err := r.Cookie("refreshToken")
	if err != nil {
		refreshHeader := r.Header.Get("Refresh-Token")
		if refreshHeader == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return false
		}	
		refreshToken := strings.TrimSpace(refreshHeader)
		return refreshToken != ""
	}
	refreshToken := refreshCookie.Value
	return refreshToken != ""
}

func validateAccessToken(r *http.Request, w http.ResponseWriter) (string, context.Context) {
	accessToken := ""
	accessCookie, err := r.Cookie("accessToken")
	if err == nil {
		accessToken = accessCookie.Value
	} else {
		accessHeader := r.Header.Get("Access-Token")
		if accessHeader == "" {
			http.Error(w, "Unauthorized: Missing Access Token", http.StatusUnauthorized)
			return "", nil
		}
		accessToken = strings.TrimSpace(accessHeader)
		if accessToken == "" {
			http.Error(w, "Unauthorized: Empty Access Token", http.StatusUnauthorized)
			return "", nil
		}
	}

	userId, err := services.NewAuthService().ValidateJwt(r.Context(), accessToken)
	if err != nil {
		log.Println("Error validating token:", err)
		http.Error(w, "Unauthorized: Invalid Token", http.StatusUnauthorized)
		return "", nil
	}

	ctxWithUser := context.WithValue(r.Context(), ContextKeyUserId, userId)
	return accessToken, ctxWithUser
}
