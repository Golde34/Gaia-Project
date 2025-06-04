package services

import (
	services "chat_hub/core/services/chat"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
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

// Connection info structure
type ConnectionInfo struct {
	Conn     *websocket.Conn
	UserId   string
	WsType   string
	LastPing time.Time
}

// Map to store all active connections
var activeConnections sync.Map

func (s *WebSocketService) HandleChatmessage(w http.ResponseWriter, r *http.Request) {
	s.handleWebSocket(w, r, "chat")
}

func (s *WebSocketService) HandleOnboarding(w http.ResponseWriter, r *http.Request) {
	s.handleWebSocket(w, r, "onboarding")
}

func (s *WebSocketService) handleWebSocket(w http.ResponseWriter, r *http.Request, wsType string) {
	ctx := r.Context()
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	jwt := r.URL.Query().Get("jwt")
	if jwt == "" || jwt == "null" || len(jwt) < 10 {
		log.Println("Missing jwt in WebSocket connection")
		return
	}

	log.Println("Client connected, jwt:", jwt)
	userId := s.validateUserJwt(ctx, jwt)
	if userId == "" {
		return
	}

	// Generate unique session ID for this connection
	sessionId := uuid.New().String()
	connInfo := &ConnectionInfo{
		Conn:     conn,
		UserId:   userId,
		WsType:   wsType,
		LastPing: time.Now(),
	}

	// Store the connection with its session ID
	activeConnections.Store(sessionId, connInfo)
	defer activeConnections.Delete(sessionId)

	// Set up ping handler
	conn.SetPingHandler(func(appData string) error {
		if info, ok := activeConnections.Load(sessionId); ok {
			info.(*ConnectionInfo).LastPing = time.Now()
		}
		return conn.WriteMessage(websocket.PongMessage, nil)
	})

	// Start connection monitoring
	go s.monitorConnection(sessionId)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Connection closed for session:", sessionId)
			break
		}

		log.Printf("Message received from session %s: %s", sessionId, message)
		messageMap := make(map[string]interface{})
		err = json.Unmarshal(message, &messageMap)
		if err != nil {
			log.Println("Error unmarshaling message:", err)
			continue
		}
		s.handleService(messageMap, userId, wsType, sessionId)
	}
}

func (s *WebSocketService) monitorConnection(sessionId string) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if info, ok := activeConnections.Load(sessionId); ok {
			connInfo := info.(*ConnectionInfo)
			if time.Since(connInfo.LastPing) > 60*time.Second {
				log.Println("Connection timeout for session:", sessionId)
				connInfo.Conn.Close()
				activeConnections.Delete(sessionId)
				return
			}
		} else {
			return
		}
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

func (s *WebSocketService) handleService(messageMap map[string]interface{}, userId, wsType, sessionId string) {
	log.Println("Handling service for userId:", userId, "with wsType:", wsType)

	switch wsType {
	case "chat":
		s.handleChatService(messageMap, userId, sessionId)
	case "onboarding":
		s.handleChatService(messageMap, userId, sessionId)
	default:
		log.Println("Unknown WebSocket type:", wsType)
	}
}

func (s *WebSocketService) handleChatService(messageMap map[string]interface{}, userId, sessionId string) {
	switch messageMap["type"] {
	case "chat_message":
		log.Println("Handling task optimized for user:", userId)
		result, err := services.NewChatService().HandleChatMessage(userId, messageMap["text"].(string))
		if err != nil {
			log.Println("Error handling chat message:", err)
			return
		}
		s.SendToUser(userId, []byte(result), sessionId)
		return
	default:
		log.Println("Unknown message type:", messageMap["type"])
	}
}

func (s *WebSocketService) SendToUser(userId string, message []byte, excludeSessionId string) {
	log.Println("Attempting to send message to user:", userId)
	log.Println("Message content:", string(message))

	// Send to all connections of this user except the excluded session
	activeConnections.Range(func(key, value interface{}) bool {
		connInfo := value.(*ConnectionInfo)
		if connInfo.UserId == userId && key.(string) != excludeSessionId {
			err := connInfo.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Println("Error sending message to session:", key.(string))
				connInfo.Conn.Close()
				activeConnections.Delete(key)
			} else {
				log.Println("Message sent successfully to session:", key.(string))
			}
		}
		return true
	})
}

func LogActiveConnections() {
	log.Println("Active connections:")
	activeConnections.Range(func(key, value interface{}) bool {
		connInfo := value.(*ConnectionInfo)
		log.Printf("- Session: %s, User: %s, Type: %s, Last Ping: %v",
			key.(string), connInfo.UserId, connInfo.WsType, connInfo.LastPing)
		return true
	})
}
