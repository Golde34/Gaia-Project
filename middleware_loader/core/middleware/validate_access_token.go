package middleware

import (
	"log"
	services "middleware_loader/core/services/auth_services"
	"net/http"
	"strings"
)

type ValidateAccessTokenMiddleware struct {
	AuthService *services.AuthService
}

func NewValidateAccessTokenMiddleware(authService *services.AuthService) *ValidateAccessTokenMiddleware {
	return &ValidateAccessTokenMiddleware{AuthService: authService}
}

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

			cookie, err := r.Cookie("accessToken")
			log.Println("Cookie: ", cookie)
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			log.Println("AAAAAAAAAAAAAAAAAAAAAA")
			accessToken := cookie.Value
			if accessToken == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			if !ValidateToken(accessToken) {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func ValidateToken(token string) bool {
	return true
}
