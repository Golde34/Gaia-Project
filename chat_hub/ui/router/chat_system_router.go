package router

import (
	usecases "chat_hub/core/usecase/chat"
	"chat_hub/ui/controller"
	"database/sql"
	"net/http"

	"github.com/go-chi/chi"
)

type ChatSystemRouter struct {
	db *sql.DB
}

func NewChatSystemRouter(db *sql.DB, r *chi.Mux) *ChatSystemRouter {
	chatHistoryUsecase := usecases.NewChatHistoryUsecase(db)
	chatUsecase := usecases.NewChatUsecase(db)

	r.Route("/chat-system", func(r chi.Router) {
		r.Get("/recent-history", func(w http.ResponseWriter, r *http.Request) {
			controller.GetRecentHistory(w, r, chatHistoryUsecase)
		})
		r.Get("/send-message", func(w http.ResponseWriter, r *http.Request) {
			controller.Chat(w, r, chatUsecase)
		})
	})

	return &ChatSystemRouter{db: db,}
}
