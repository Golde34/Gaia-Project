package router

import (
	"database/sql"
	"net/http"
	"personal_task_manager/core/usecase"
	"personal_task_manager/ui/controller"

	"github.com/go-chi/chi"
)

type ProjectRouter struct {
	
}

func NewProjectRouter(r *chi.Mux, db *sql.DB) *ProjectRouter {
	usecase := usecase.NewProjectUsecase(db)
	r.Route("/project", func(r chi.Router) {
		r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller.GetProject(w, r, usecase)
		})
		r.Get("/all/{userId}", func(w http.ResponseWriter, r *http.Request) {
			controller.GetAllProject(w, r, usecase)
		})
		r.Post("/create", func(w http.ResponseWriter, r *http.Request) {
			controller.CreateProject(w, r, usecase)
		})
	})
	return &ProjectRouter{
	}
}
