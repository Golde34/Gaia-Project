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
