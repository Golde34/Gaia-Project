package routers

import (
	"middleware_loader/core/domain/enums"
	"middleware_loader/core/middleware"
	"middleware_loader/core/services/task_manager"
	database_mongo "middleware_loader/kernel/database/mongo"
	"middleware_loader/ui/controller_services/task_manager"
	"net/http"

	"github.com/go-chi/chi"
)

type ProjectRouter struct {
	ProjectService *services.ProjectService
}

func NewProjectRouter(projectService *services.ProjectService, db database_mongo.Database, r *chi.Mux) *ProjectRouter {
	r.Route("/project", func(r chi.Router) {
		r.Use(middleware.CheckMicroserviceStatus(db, enums.TASK_MANAGER))
		r.Get("/all", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ListAll(w, r, projectService)
		})
		r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetById(w, r, projectService)
		})
		r.Post("/create", func(w http.ResponseWriter, r *http.Request) {
			controller_services.CreateProject(w, r, projectService)
		})
		r.Put("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.UpdateProject(w, r, projectService)
		})
		r.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.DeleteProject(w, r, projectService)
		})
		r.Get("/{id}/group-tasks", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetGroupTasksInProject(w, r, projectService)
		})
		r.Put("/{id}/update-name", func(w http.ResponseWriter, r *http.Request) {
			controller_services.UpdateProjectName(w, r, projectService)
		})
		r.Put("/{id}/update-color", func(w http.ResponseWriter, r *http.Request) {
			controller_services.UpdateProjectColor(w, r, projectService)
		})
		r.Put("/{id}/archive", func(w http.ResponseWriter, r *http.Request) {
			controller_services.ArchiveProject(w, r, projectService)
		})
		r.Put("/{id}/enable", func(w http.ResponseWriter, r *http.Request) {
			controller_services.EnableProject(w, r, projectService)
		})
	})
	return &ProjectRouter{
		ProjectService: projectService,
	}
}
