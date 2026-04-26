package router

import (
	"database/sql"
	"net/http"
	"personal_task_manager/core/usecase"
	"personal_task_manager/ui/controller"

	"github.com/go-chi/chi"
)

type GroupTaskRouter struct {
	
}

func NewGroupTaskRouter(r *chi.Mux, db *sql.DB) *GroupTaskRouter {
	usecase := usecase.NewGroupTaskUsecase(db)
	r.Route("/group-task", func(r chi.Router) {
		r.Get("/project/{projectId}", func(w http.ResponseWriter, r *http.Request) {
			controller.GetAllGroupTasksInProject(w, r, usecase)
		})
	})
	return &GroupTaskRouter{
	}
}
