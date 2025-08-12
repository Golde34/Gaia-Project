package router

import (
	"chat_hub/core/services"
	"chat_hub/ui/controller"
	"net/http"

	"github.com/go-chi/chi"
)

type AuthRefreshTokenRouter struct {
	AuthService *services.AuthService
}

func NewAuthRefreshTokenRouter(r *chi.Mux, authService *services.AuthService) *AuthRefreshTokenRouter {
	r.Route("/auth", func(r chi.Router) {
		r.Post("/refresh-token", func(w http.ResponseWriter, r *http.Request) {
			controller.RefreshToken(w, r, authService)
		})
	})
	return &AuthRefreshTokenRouter{
		AuthService: authService,
	}
}
