package router

import (
	usecases "chat_hub/core/usecase/chat"
	"chat_hub/ui/controller"
	"database/sql"
	"net/http"

	"github.com/go-chi/chi"
)

type ChatRouter struct {
	db *sql.DB

	ChatUsecase *usecases.ChatUsecase
}

func NewChatRouter(db *sql.DB, r *chi.Mux) *ChatRouter {
	chatUsecase := usecases.NewChatUsecase(db)

	r.Route("/chat", func(r chi.Router) {
		r.Post("/initiate-chat", func(w http.ResponseWriter, r *http.Request) {
			controller.InitiateChat(w, r, chatUsecase)
		})
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			controller.Chat(w, r, chatUsecase)
		})
	})

	return &ChatRouter{
		db:          db,
		ChatUsecase: chatUsecase,
	}
}
