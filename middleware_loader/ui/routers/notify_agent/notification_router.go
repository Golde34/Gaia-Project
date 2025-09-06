package routers

import (
	services "middleware_loader/core/services/notify_agent"
	controller_services "middleware_loader/ui/controller_services/notify_agent"
	"net/http"

	"github.com/go-chi/chi"
)

type NotificationRouter struct {
	NotificationService *services.NotificationService
}

func NewNotificationRouter(notificationService *services.NotificationService, r *chi.Mux) *NotificationRouter {
	r.Route("/notification", func(r chi.Router) {
		r.Get("/all", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetAllNotifications(w, r, notificationService)
		})
	})
	return &NotificationRouter{
		NotificationService: notificationService,
	}
}