package router

import (
	usecases "chat_hub/core/usecase/chat"
	"chat_hub/ui/controller"
	"database/sql"
	"net/http"

	"github.com/go-chi/chi"
)

type ChatInteractionRouter struct {
	db *sql.DB
}

func NewChatInteractionRouter(db *sql.DB, r *chi.Mux) *ChatInteractionRouter {
	chatUsecase := usecases.NewChatUsecase(db)
	chatHistoryUsecase := usecases.NewChatHistoryUsecase(db)
	chatDialogueUsecase := usecases.NewChatDialogueUsecase(db)

	r.Route("/chat-interaction", func(r chi.Router) {
		r.Post("/initiate-chat", func(w http.ResponseWriter, r *http.Request) {
			controller.InitiateChat(w, r, chatUsecase)
		})
		r.Get("/history", func(w http.ResponseWriter, r *http.Request) {
			controller.GetChatHistory(w, r, chatHistoryUsecase)
		})
		r.Get("/dialogues", func(w http.ResponseWriter, r *http.Request) {
			controller.GetChatDialogues(w, r, chatDialogueUsecase)
		})
	})

	return &ChatInteractionRouter{db: db,}
}
