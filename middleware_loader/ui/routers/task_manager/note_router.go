package routers

import (
	"middleware_loader/core/domain/enums"
	"middleware_loader/core/middleware"
	services "middleware_loader/core/services/task_manager"
	database_mongo "middleware_loader/kernel/database/mongo"
	controller_services "middleware_loader/ui/controller_services/task_manager"
	"net/http"

	"github.com/go-chi/chi"
)

type NoteRouter struct {
	NoteService *services.NoteService
}

func NewNoteRouter(noteService *services.NoteService, db database_mongo.Database, r *chi.Mux) *NoteRouter {
	r.Route("/note", func(r chi.Router) {
		r.Use(middleware.CheckMicroserviceStatus(db, enums.TASK_MANAGER))
		r.Get("/list", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetAllNotes(w, r, noteService)
		})
		r.Post("/create", func(w http.ResponseWriter, r *http.Request) {
			controller_services.CreateNote(w, r, noteService)
		})
		r.Put("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.UpdateNote(w, r, noteService)
		})
		r.Put("/lock/{id}", func (w http.ResponseWriter, r *http.Request) {
			controller_services.LockNote(w, r, noteService)
		})
		r.Put("/unlock/{id}", func (w http.ResponseWriter, r *http.Request) {
			controller_services.UnlockNote(w, r, noteService)
		})
		r.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.DeleteNoteById(w, r, noteService)
		})
		r.Get("/detail/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.GetNoteById(w, r, noteService)
		})
		r.Post("/update/{id}", func(w http.ResponseWriter, r *http.Request) {
			controller_services.UpdateNote(w, r, noteService)
		})
	})
	return &NoteRouter{
		NoteService: noteService,
	}
}