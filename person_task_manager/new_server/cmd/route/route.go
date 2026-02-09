package route

import (
	"database/sql"

	"github.com/go-chi/chi"

	project_router "personal_task_manager/ui/router"
)

func Setup(router *chi.Mux, db *sql.DB) {
	router.Group(func(r chi.Router) {
		project_router.NewProjectRouter(router)
	})
}
