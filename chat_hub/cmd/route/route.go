package route

import (
	"database/sql"

	"github.com/go-chi/chi"
	chathubRouter "chat_hub/ui/router"
)

func Setup(router *chi.Mux, db *sql.DB) {
	router.Group(func(r chi.Router) {
		chathubRouter.NewChatHistoryRouter(db, router)
	})	
}
