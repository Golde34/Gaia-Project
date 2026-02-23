package route

import (
	"database/sql"

	"github.com/go-chi/chi"

	br "personal_task_manager/ui/router"
)

func Setup(router *chi.Mux, db *sql.DB) {
	router.Group(func(r chi.Router) {
		br.NewProjectRouter(router, db)
		br.NewGroupTaskRouter(router, db)
	})
}
