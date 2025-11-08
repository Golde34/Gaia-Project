package websocket_service

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	services "notify_agent/core/services/business"
	"sync"

	"github.com/gorilla/websocket"
)

type WebSocketService struct{}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var userConnections sync.Map

func (s *WebSocketService) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	jwt := r.URL.Query().Get("jwt")
	if jwt == "" {
		log.Println("Missing jwt in WebSocket connection")
		return
	}

	log.Println("Client connected, jwt:", jwt)
	userId := s.validateUserJwt(ctx, jwt)

	if existingConn, ok := userConnections.Load(userId); ok {
		log.Println("Closing existing connection for user:", userId)
		existingConn.(*websocket.Conn).Close()
	}
	userConnections.Store(userId, conn)

	conn.SetPingHandler(func(appData string) error {
		log.Println("Received ping from user:", userId)
		err := conn.WriteMessage(websocket.PongMessage, nil)
		if err != nil {
			log.Println("Error sending pong:", err)
		}
		return err
	})

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Connection closed for userId:", userId)
			userConnections.Delete(userId)
			break
		}
		log.Printf("Message received from userId %s: %s", userId, message)
	}
}

func (s *WebSocketService) validateUserJwt(ctx context.Context, jwt string) string {
	userId, err := services.NewAuthService().ValidateJwt(ctx, jwt)
	if err != nil {
		log.Println("JWT validation error, it should never happen:", err)
		return ""
	}
	log.Println("JWT validated successfully, userId:", userId)
	return userId
}

func (s *WebSocketService) SendToUser(userId string, message []byte) {
	log.Println("Attempting to send message to user:", userId)

	if conn, ok := userConnections.Load(userId); ok {
		wsConn := conn.(*websocket.Conn)

		err := wsConn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Error sending message to user:", userId, "Error:", err)
			wsConn.Close()
			userConnections.Delete(userId)
		} else {
			log.Println("Message sent successfully to user:", userId)
		}
	} else {
		log.Println("No active connection found for user:", userId)
	}
}

func (s *WebSocketService) HandleOptimizeTask(userId string, status bool) {
	log.Printf("Starting optimization task for user %s...", userId)

	response := map[string]interface{}{
		"type":   "task_optimized",
		"userId": userId,
		"status": "success",
	}
	if !status {
		response["status"] = "failed"
		response["type"] = "task_failed"
	}

	responseBytes, err := json.Marshal(response)
	if err != nil {
		log.Println("Error marshaling response:", err)
		return
	}
	log.Println("Response:", string(responseBytes))

	LogActiveConnections()
	s.SendToUser(userId, responseBytes)
}

func LogActiveConnections() {
	log.Println("Active connections:")
	userConnections.Range(func(key, value interface{}) bool {
		log.Println("- UserId:", key.(string))
		return true
	})
}
