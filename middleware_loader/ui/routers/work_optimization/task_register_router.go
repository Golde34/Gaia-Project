package routers

import (
	// "middleware_loader/core/domain/enums"
	// "middleware_loader/core/middleware"
	services "middleware_loader/core/services/work_optimization"
	database_mongo "middleware_loader/kernel/database/mongo"
	controller_services "middleware_loader/ui/controller_services/work_optimization"
	"net/http"

	"github.com/go-chi/chi"
)

type TaskRegisterRouter struct {
	TaskRegisterService *services.TaskRegisterService
}

func NewTaskRegistrationRouter(taskRegisterService *services.TaskRegisterService, db database_mongo.Database, r *chi.Mux) *TaskRegisterRouter {
	r.Route("/work-optimization", func(r chi.Router) {
		// r.Use(middleware.CheckMicroserviceStatus(db, enums.WORK_OPTIMIZATION))	
		r.Post("/register-task-config", func(w http.ResponseWriter, r *http.Request) {
			controller_services.RegisterTaskConfig(w, r, taskRegisterService)
		})
		r.Get("/query-task-config", func(w http.ResponseWriter, r *http.Request) {
			controller_services.QueryTaskConfig(w, r, taskRegisterService)
		})
	})
	return &TaskRegisterRouter{
		TaskRegisterService: taskRegisterService,
	}
}