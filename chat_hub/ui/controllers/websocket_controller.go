package controllers

import (
	"net/http"
	services "notify_agent/core/services/websocket"
)

func HandleWebSocket(w http.ResponseWriter, r *http.Request, webSocketService *services.WebSocketService) {
	webSocketService.HandleWebSocket(w, r)
}