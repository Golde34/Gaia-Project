package router

import (
	"net/http"
	"personal_task_manager/core/usecase"
	"personal_task_manager/ui/controller"

	"github.com/go-chi/chi"
)

type ProjectRouter struct {
	
}

func NewProjectRouter(r *chi.Mux) *ProjectRouter {
	usecase := usecase.NewProjectUsecase()
	r.Route("/project", func(r chi.Router) {
		r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller.GetProject(w, r, usecase)
		})
	})
	return &ProjectRouter{
	}
}
