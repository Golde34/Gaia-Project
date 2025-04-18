package routers

import (
	"net/http"
	services "notify_agent/core/services/websocket"
	"notify_agent/ui/controllers"

	"github.com/go-chi/chi"
)

type WebSocketRouter struct { 
	WebSocketService *services.WebSocketService
}

func NewWebSocketRouter(webSocketService *services.WebSocketService, r *chi.Mux) *WebSocketRouter {
	r.Route("/ws/test", func(r chi.Router) {
		r.Get("/{userId}", func(w http.ResponseWriter, r *http.Request) {
			controllers.HandleWebSocket(w, r, webSocketService)
		})
	})
	return &WebSocketRouter{
		WebSocketService: webSocketService,	
	}
}