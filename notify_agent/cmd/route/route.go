package route

import (
	websocket_services "notify_agent/core/services/websocket"
	"notify_agent/ui/routers"

	"github.com/go-chi/chi"
)

func Setup(router *chi.Mux) {
	websocketService := websocket_services.NewWebSocketService()

	router.Group(func(r chi.Router) {
		routers.NewWebSocketRouter(websocketService, router)
	})
}