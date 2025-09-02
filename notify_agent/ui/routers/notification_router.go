package routers

import (
	"database/sql"
	"net/http"
	services "notify_agent/core/services/business"
	"notify_agent/ui/controllers"

	"github.com/go-chi/chi"
)

type NotificationRouter struct {
	db *sql.DB
}

func NewNotificationRouter(db *sql.DB, r *chi.Mux) *NotificationRouter {
	notificationService := services.NewNotificationService(db)
	r.Route("/notification", func(r chi.Router) {
		r.Get("/all/{userId}", func(w http.ResponseWriter, r *http.Request) {
			controllers.GetAllNotificationsByUserId(w, r, notificationService)
		})
	})

	return &NotificationRouter{db: db}
}
