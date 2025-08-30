package route

import (
	"database/sql"

	"chat_hub/core/services"
	chathubRouter "chat_hub/ui/router"

	"github.com/go-chi/chi"
)

func Setup(router *chi.Mux, db *sql.DB) {
	router.Group(func(r chi.Router) {
		chathubRouter.NewChatInteractionRouter(db, router)
		chathubRouter.NewChatSystemRouter(db, router)
		chathubRouter.NewAuthRefreshTokenRouter(router, services.NewAuthService())
	})
}
