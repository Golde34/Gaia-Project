package route

import (
	"database/sql"

	"github.com/go-chi/chi"
)

func Setup(router *chi.Mux, db *sql.DB) {
	router.Group(func(r chi.Router) {
	})
}