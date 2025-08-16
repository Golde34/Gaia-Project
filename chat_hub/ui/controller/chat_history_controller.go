package controller

import (
	base_dtos "chat_hub/core/domain/dtos/base"
	"chat_hub/core/middleware"
	usecases "chat_hub/core/usecase/chat"
	"encoding/json"
	"fmt"
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
		size = "10" 
	}
	sizeInt, err := strconv.Atoi(size)
	if err != nil {
		http.Error(w, "Invalid size parameter", http.StatusBadRequest)
		return
	}

	cursor := r.URL.Query().Get("cursor")

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	dialogueId := r.URL.Query().Get("dialogueId")
	chatType := r.URL.Query().Get("chatType")

	response, err := chatUsecase.GetChatHistory(userId, dialogueId, chatType, sizeInt, cursor)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetChatDialogues(w http.ResponseWriter, r *http.Request, dialogueUsecase *usecases.ChatDialogueUsecase) {
	size := r.URL.Query().Get("size")
	if size == "" {
		size = "20" 
	}
	sizeInt, err := strconv.Atoi(size)
	if err != nil {
		http.Error(w, "Invalid size parameter", http.StatusBadRequest)
		return
	}

	cursor := r.URL.Query().Get("cursor")

	// userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	userId := "1"

	dialogues, err := dialogueUsecase.GetChatDialogues(userId, sizeInt, cursor)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := base_dtos.ErrorResponse{
		Status:        "Success",
		StatusMessage: "Success",
		ErrorCode:     200,
		ErrorMessage:  "Chat dialogues retrieved successfully",
		Data:         dialogues,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
