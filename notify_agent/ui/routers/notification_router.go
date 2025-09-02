package routers

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/chi"
)

type NotificationRouter struct {
	db *sql.DB
}

func NewNotificationRouter(db *sql.DB, r *chi.Mux) * NotificationRouter {
	r.Route("/notification", func(r chi.Router) {
		r.Get("/all/{userId}", func(w http.ResponseWriter, r *http.Request) {
			// controllers.GetAllNotification(w, r, notificationUsecase)
		})
	})

	return &NotificationRouter{db: db,}
}