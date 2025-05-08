package middleware

import (
	"context"
	"log"
	services "middleware_loader/core/services/auth_services"
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
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return false
	}
	refreshToken := refreshCookie.Value
	return refreshToken != ""
}

func validateAccessToken(r *http.Request, w http.ResponseWriter) (string, context.Context) {
	accessCookie, err := r.Cookie("accessToken")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return "", nil
	}
	accessToken := accessCookie.Value
	if accessToken == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return "", nil
	}

	tokenResponse, err := services.NewAuthService().CheckToken(r.Context(), accessToken)
	if err != nil {
		log.Println("Error validating token:", err)
		return "", nil
	}

	ctxWithUser := context.WithValue(r.Context(), ContextKeyUserId, tokenResponse.Id)
	return accessToken, ctxWithUser
}
