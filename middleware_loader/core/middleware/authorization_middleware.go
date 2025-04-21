package middleware

import (
	"context"
	services "middleware_loader/core/services/auth_services"
	"middleware_loader/infrastructure/graph/model"
	"net/http"
)

type AuthorizationMiddleware struct {}

func NewAuthorizationMiddleware() *AuthorizationMiddleware {
	return &AuthorizationMiddleware{}
}

func CheckAuthorization() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// get authorization hash in redis
			// check if the authorization hash is valid
			// if not, return 401
			result, err := CheckAuthorizationInAuthService(r)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("Unauthorized"))
				return
			}
			ctx := context.WithValue(r.Context(), "user", result)
			// if valid, call the next handler
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func CheckAuthorizationInAuthService(r *http.Request) (model.TokenResponse, error) {
	accessToken := r.Header.Get("Authorization")
	ctx := r.Context()
	var input model.TokenInput
	input.Token = accessToken
	result, err := services.NewAuthService().CheckToken(ctx, input)
	if err != nil {
		return model.TokenResponse{}, err
	}
	return result, nil	
}