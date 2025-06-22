package services

import (
	services "chat_hub/core/services/chat"
	usecases "chat_hub/core/usecase"
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type WebSocketService struct {
	db *sql.DB

	chatService *usecases.ChatUsecase
	authService *services.AuthService
}

func NewWebSocketService(db *sql.DB) *WebSocketService {
	return &WebSocketService{
		db: db,
		chatService: usecases.NewChatUsecase(db),
		authService: services.NewAuthService(),
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type ConnectionInfo struct {
	Conn     *websocket.Conn
	UserId   string
	WsType   string
	LastPing time.Time
}

var activeConnections sync.Map

func (s *WebSocketService) HandleChatmessage(w http.ResponseWriter, r *http.Request) {
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
		LastPing: time.Now(),
	}

	activeConnections.Store(sessionId, connInfo)
	defer activeConnections.Delete(sessionId)

	conn.SetPingHandler(func(appData string) error {
		if info, ok := activeConnections.Load(sessionId); ok {
			info.(*ConnectionInfo).LastPing = time.Now()
		}
		return conn.WriteMessage(websocket.PongMessage, nil)
	})

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

		s.handleService(messageMap, userId, sessionId)
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
	userId, err := s.authService.ValidateJwt(ctx, jwt)
	if err != nil {
		log.Println("JWT validation error, it should never happen:", err)
		return ""
	}
	log.Println("JWT validated successfully, userId:", userId)
	return userId
}

func (s *WebSocketService) handleService(messageMap map[string]interface{}, userId, sessionId string) {
	switch messageMap["type"] {
	case "chat_message":
		log.Println("Handling task optimized for user:", userId)
		result, err := s.chatService.HandleChatMessage(userId, messageMap["text"].(string))
		if err != nil {
			log.Println("Error handling chat message:", err)
			return
		}
		s.SendToUser(userId, []byte(result), sessionId)
		return
	case "gaia_introduction":
		log.Println("Handling onboarding step for user:", userId)
		result, err := s.chatService.HandleGaiaIntroductionMessage(
			userId, messageMap["text"].(string), messageMap["type"].(string))
		if err != nil {
			log.Println("Error handling onboarding step:", err)
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

	activeConnections.Range(func(key, value interface{}) bool {
		connInfo := value.(*ConnectionInfo)
		if connInfo.UserId == userId && key.(string) == excludeSessionId {
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
