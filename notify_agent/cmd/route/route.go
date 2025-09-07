package route

import (
	"database/sql"
	"notify_agent/ui/routers"

	"github.com/go-chi/chi"
)

func Setup(router *chi.Mux, db *sql.DB) {
	router.Group(func(r chi.Router) {
		routers.NewNotificationRouter(db, router)
	})
}