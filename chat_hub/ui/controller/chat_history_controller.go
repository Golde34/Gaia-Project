package controller

import (
	usecases "chat_hub/core/usecase/chat"
	"encoding/json"
	"net/http"
	"strconv"
)

func GetRecentHistory(w http.ResponseWriter, r *http.Request, chatUsecase *usecases.ChatHistoryUsecase) {
	userId := r.URL.Query().Get("userId")
	if userId == "" {
		http.Error(w, "userId is required", http.StatusBadRequest)
		return
	}
	dialogueId := r.URL.Query().Get("dialogueId")
	if dialogueId == "" {
		http.Error(w, "dialogueId is required", http.StatusBadRequest)
		return
	}
	numberOfMessagesInt := 5
	numberOfMessages := r.URL.Query().Get("numberOfMessages")
	if numberOfMessages == "" {
		numberOfMessagesInt = 5
	} else {
		var err error
		numberOfMessagesInt, err = strconv.Atoi(numberOfMessages)
		if err != nil {
			http.Error(w, "Invalid numberOfMessages", http.StatusBadRequest)
			return
		}
	}
	dialoguesWithMessages, err := chatUsecase.GetRecentHistory(userId, dialogueId, numberOfMessagesInt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}	

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(dialoguesWithMessages); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetChatHistory(w http.ResponseWriter, r *http.Request, chatUsecase *usecases.ChatHistoryUsecase) {
	size := r.URL.Query().Get("size")
	if size == "" {
		size = "10" // Default size if not provided
	}
	sizeInt, err := strconv.Atoi(size)
	if err != nil {
		http.Error(w, "Invalid size parameter", http.StatusBadRequest)
		return
	}

	page := r.URL.Query().Get("page")
	if page == "" {
		page = "0" // Default page if not provided
	}
	pageInt, err := strconv.Atoi(page)
	if err != nil {
		http.Error(w, "Invalid page parameter", http.StatusBadRequest)
		return
	}

	userId := r.URL.Query().Get("userId")
	if userId == "" {
		http.Error(w, "userId is required", http.StatusBadRequest)
		return
	}
	dialogueId := r.URL.Query().Get("dialogueId")
	if dialogueId == "" {
		http.Error(w, "dialogueId is required", http.StatusBadRequest)
		return
	}

	chatType := r.URL.Query().Get("chatType")

	dialoguesWithMessages, err := chatUsecase.GetChatHistory(userId, dialogueId, chatType, sizeInt, pageInt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(dialoguesWithMessages); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}