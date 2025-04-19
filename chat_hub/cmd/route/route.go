package route

import (
	websocket_services "chat_hub/core/services/websocket"
	"chat_hub/ui/routers"

	"github.com/go-chi/chi"
)

func Setup(router *chi.Mux) {
	websocketService := websocket_services.NewWebSocketService()

	router.Group(func(r chi.Router) {
		routers.NewWebSocketRouter(websocketService, router)
	})
}