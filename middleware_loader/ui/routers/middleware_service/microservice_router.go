package routers

import (
	"middleware_loader/core/services/middleware_loader"
	"middleware_loader/core/port/store"
	database_mongo "middleware_loader/kernel/database/mongo"
	"middleware_loader/ui/controller_services/middleware_loader"
	"net/http"

	"github.com/go-chi/chi"
)

type MicroserviceRouter struct {
	MicroserviceConfigurationDB database_mongo.Database
}

func NewMicroserviceRouter(db database_mongo.Database, r *chi.Mux) *MicroserviceRouter {
	microserviceConfigurationStore := store.NewMicroserviceConfigurationStore(db)
	microserviceConfigurationService := services.NewMicroserviceConfigurationService(microserviceConfigurationStore)
	screenConfigurationStore := store.NewScreenConfigurationStore(db)
	screenConfigurationService := services.NewScreenConfigurationService(screenConfigurationStore)
	r.Route("/microservice", func(r chi.Router) {
			r.Get("/status", func(w http.ResponseWriter, r *http.Request) {
				controller_services.CheckMicroservice(w, r, microserviceConfigurationService)
			})
			r.Get("/all", func(w http.ResponseWriter, r *http.Request) {
				controller_services.GetAllMicroservices(w, r, microserviceConfigurationService)
			})
			r.Get("/get-service", func(w http.ResponseWriter, r *http.Request) {
				controller_services.GetMicroservice(w, r, microserviceConfigurationService)
			})
			r.Post("/insert-microservice-configuration", func(w http.ResponseWriter, r *http.Request) {
				controller_services.InsertMicroserviceConfiguration(w, r, microserviceConfigurationService)
			})
			r.Get("/gaia-screen", func(w http.ResponseWriter, r *http.Request) {
				controller_services.GetGaiaScreens(w, r, screenConfigurationService)
			})
		})
	return &MicroserviceRouter{
		MicroserviceConfigurationDB: db,
	}
}
