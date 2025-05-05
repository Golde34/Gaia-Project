package middleware

import (
	"context"
	"log"
	services "middleware_loader/core/services/auth_services"
	"net/http"
	"strings"
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

			validateRefreshToken := validateRefreshToken(r.Context(), r, w)
			if !validateRefreshToken {
				http.Error(w, "Unauthorized", http.StatusForbidden)
				return
			}

			validateAccessToken := validateAccessToken(r.Context(), r, w)
			if !validateAccessToken {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func validateRefreshToken(ctx context.Context, r *http.Request, w http.ResponseWriter) bool {
	refreshCookie, err := r.Cookie("refreshToken")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return false
	}
	refreshToken := refreshCookie.Value
	return refreshToken != ""
}

func validateAccessToken(ctx context.Context, r *http.Request, w http.ResponseWriter) bool {
	accessCookie, err := r.Cookie("accessToken")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return false
	}
	accessToken := accessCookie.Value
	if accessToken == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return false
	}

	_, err = services.NewAuthService().CheckToken(ctx, accessToken)
	if err != nil {
		log.Println("Error validating token:", err)
		return false
	}

	return true
}
