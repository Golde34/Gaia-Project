package router

import (
	usecases "chat_hub/core/usecase/chat"
	"chat_hub/ui/controller"
	"database/sql"
	"net/http"

	"github.com/go-chi/chi"
)

type ChatHistoryRouter struct {
	db *sql.DB

	ChatHistoryUsecase *usecases.ChatHistoryUsecase
}

func NewChatHistoryRouter(db *sql.DB, r *chi.Mux) *ChatHistoryRouter {
	chatHistoryUsecase := usecases.NewChatHistoryUsecase(db)

	r.Route("/chat-history", func(r chi.Router) {
		r.Get("/recent-history", func(w http.ResponseWriter, r *http.Request) {
			controller.GetRecentHistory(w, r, chatHistoryUsecase)
		})
	})

	return &ChatHistoryRouter{
		db:                 db,
		ChatHistoryUsecase: chatHistoryUsecase,
	}
}
