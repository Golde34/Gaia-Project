package controllers

import (
	"net/http"
	services "chat_hub/core/services/websocket"
)

func HandleWebSocket(w http.ResponseWriter, r *http.Request, webSocketService *services.WebSocketService) {
	webSocketService.HandleWebSocket(w, r)
}