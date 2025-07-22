package controller

import (
	"chat_hub/core/middleware"
	usecases "chat_hub/core/usecase/chat"
	"encoding/json"
	"fmt"
	"net/http"
)

func Chat(w http.ResponseWriter, r *http.Request, chatUsecase *usecases.ChatUsecase) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	dialogueId := r.URL.Query().Get("dialogueId")
	message := r.URL.Query().Get("message")
	msgType := r.URL.Query().Get("type")

	if message == "" {
		http.Error(w, "message are required", http.StatusBadRequest)
		return
	}

	result, err := chatUsecase.HandleChatMessage(userId, dialogueId, message, msgType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "data: %s\n\n", result)
	flusher.Flush()
}

func InitiateChat(w http.ResponseWriter, r *http.Request, chatUsecase *usecases.ChatUsecase) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	sseToken , err := chatUsecase.InitiateChat(r.Context(), userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(sseToken); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}	
}

// func Chat(w http.ResponseWriter, r *http.Request, chatUsecase *usecases.ChatUsecase) {
// 	// Check for SSE token in query parameter
// 	sseToken := r.URL.Query().Get("sseToken")
// 	if sseToken == "" {
// 		http.Error(w, "Missing SSE token", http.StatusUnauthorized)
// 		return
// 	}

// 	// Validate SSE token
// 	userId, err := middleware.ValidateSseToken(sseToken)
// 	if err != nil {
// 		http.Error(w, "Unauthorized: Invalid SSE token", http.StatusUnauthorized)
// 		return
// 	}

// 	ctx := context.WithValue(r.Context(), middleware.ContextKeyUserId, userId)
// 	r = r.WithContext(ctx)

// 	// Get query parameters
// 	dialogueId := r.URL.Query().Get("dialogueId")
// 	message := r.URL.Query().Get("message")
// 	chatType := r.URL.Query().Get("type")

// 	if message == "" || dialogueId == "" || chatType == "" {
// 		http.Error(w, "Missing required parameters", http.StatusBadRequest)
// 		return
// 	}

// 	// Set SSE headers
// 	w.Header().Set("Content-Type", "text/event-stream")
// 	w.Header().Set("Cache-Control", "no-cache")
// 	w.Header().Set("Connection", "keep-alive")
// 	w.Header().Set("Access-Control-Allow-Origin", "*") // Adjust for production

// 	// Create a new message
// 	newMessage := entity.MessageEntity{
// 		UserId:      userId,
// 		DialogueId:  dialogueId,
// 		SenderType:  "user",
// 		Content:     message,
// 		CreatedAt:   time.Now(),
// 	}

// 	// Save message (adjust to your repository)
// 	err = chatUsecase.SaveMessage(newMessage)
// 	if err != nil {
// 		log.Println("Error saving message:", err)
// 		http.Error(w, "Failed to save message", http.StatusInternalServerError)
// 		return
// 	}

// 	// Send SSE event
// 	data, err := json.Marshal(newMessage)
// 	if err != nil {
// 		log.Println("Error marshaling response:", err)
// 		return
// 	}
// 	_, err = fmt.Fprintf(w, "data: %s\n\n", data)
// 	if err != nil {
// 		log.Println("Error sending SSE event:", err)
// 		return
// 	}
// 	w.(http.Flusher).Flush()
// }
