package routers

import (
	"middleware_loader/core/domain/enums"
	"middleware_loader/core/middleware"
	"middleware_loader/core/services/auth_services"
	database_mongo "middleware_loader/kernel/database/mongo"
	controller "middleware_loader/ui/controller_services/auth_service"
	"net/http"

	"github.com/go-chi/chi"
)

type AuthRouter struct {
	AuthService *services.AuthService
}

func NewAuthRouter(authService *services.AuthService, db database_mongo.Database, r *chi.Mux) *AuthRouter {
	r.Route("/auth", func(r chi.Router) {
		r.Use(middleware.CheckMicroserviceStatus(db, enums.AUTH_SERVICE))
		r.Post("/sign-in", func(w http.ResponseWriter, r *http.Request) {
			controller.Signin(w, r, authService)
		})
		r.Post("/gaia-auto-sign-in", func(w http.ResponseWriter, r *http.Request) {
			controller.GaiaAutoSignin(w, r, authService)
		})
		r.Post("/refresh-token", func(w http.ResponseWriter, r *http.Request) {
			controller.RefreshToken(w, r, authService)
		})
		r.Post("/get-service-jwt", func(w http.ResponseWriter, r *http.Request) {
			controller.GetServiceJWT(w, r, authService)
		})
		r.Post("/sign-up", func(w http.ResponseWriter, r *http.Request) {
			controller.Signup(w, r, authService)
		})
		r.Delete("/sign-out", func(w http.ResponseWriter, r *http.Request) {
			controller.Signout(w, r, authService)
		})
		r.Post("/mobile-sign-in", func(w http.ResponseWriter, r *http.Request) {
			controller.MobileSignin(w, r, authService)
		})
	})
	return &AuthRouter{
		AuthService: authService,
	}
}
