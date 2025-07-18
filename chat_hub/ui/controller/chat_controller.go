package controller

import (
	usecases "chat_hub/core/usecase/chat"
	"fmt"
	"net/http"
)

func Chat(w http.ResponseWriter, r *http.Request, chatUsecase *usecases.ChatUsecase) {
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

	result, err := chatUsecase.HandleChatMessage(dialogueId, message, msgType)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "data: %s\n\n", result)
	flusher.Flush()
}
