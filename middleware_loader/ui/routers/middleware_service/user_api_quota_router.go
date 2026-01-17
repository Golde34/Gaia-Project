package routers

import (
	"middleware_loader/core/services/middleware_loader"
	database_mongo "middleware_loader/kernel/database/mongo"
	"middleware_loader/ui/controller_services/middleware_loader"
	"net/http"

	"github.com/go-chi/chi"
)

type UserApiQuotaRouter struct {
	UserApiQuotaService *services.UserApiQuotaService
}

func NewUserApiQuotaRouter(db database_mongo.Database, r *chi.Mux) *UserApiQuotaRouter {
	userApiQuotaService := services.NewUserApiQuotaService(db)
	r.Route("/api-quota", func(r chi.Router) {
		r.Get("/sync-project-memory", func(w http.ResponseWriter, r *http.Request) {
			controller_services.SyncProjectMemory(w, r, userApiQuotaService)
		})
	})
	return &UserApiQuotaRouter{
		UserApiQuotaService: userApiQuotaService,
	}
}
