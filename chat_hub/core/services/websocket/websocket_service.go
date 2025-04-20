package services

import (
	services "chat_hub/core/services/chat"
	"encoding/json"
	"log"
	"net/http"
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
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	userId := r.URL.Query().Get("userId")
	if userId == "" {
		log.Println("Missing userId in WebSocket connection")
		return
	}

	log.Println("Client connected, userId:", userId)

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
		messageMap := make(map[string]interface{})
		err = json.Unmarshal(message, &messageMap)
		if err != nil {
			log.Println("Error unmarshaling message:", err)
			continue
		}
		// response := "Bot answered user prompt: " + messageMap["text"].(string)
		// SendToUser(userId, []byte(response))
		handleService(messageMap, userId)
	}
}

func handleService(messageMap map[string]interface{}, userId string) {
	switch messageMap["type"] {
	case "chat_message":
		log.Println("Handling task optimized for user:", userId)
		result, err := services.NewChatService().HandleChatMessage(userId, messageMap["text"].(string))
		if err != nil {
			log.Println("Error handling chat message:", err)
			return
		}
		SendToUser(userId, []byte(result))
		return
	default:
		log.Println("Unknown message type:", messageMap["type"])
	}
}


func SendToUser(userId string, message []byte) {
	log.Println("Attempting to send message to user:", userId)
	log.Println("Message content:", string(message))

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
	SendToUser(userId, responseBytes)
}

func LogActiveConnections() {
	log.Println("Active connections:")
	userConnections.Range(func(key, value interface{}) bool {
		log.Println("- UserId:", key.(string))
		return true
	})
}
