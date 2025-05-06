package controller_services

import (
	"encoding/json"
	"fmt"
	"log"

	base_dtos "middleware_loader/core/domain/dtos/base"
	"middleware_loader/core/middleware"
	mapper "middleware_loader/core/port/mapper/request"
	services "middleware_loader/core/services/task_manager"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
	"middleware_loader/ui/controller_services/controller_utils"
	"net/http"

	"github.com/go-chi/chi"
)

func GetAllNotes(w http.ResponseWriter, r *http.Request, noteService *services.NoteService) {
	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input := mapper.GetId(userId)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "getAllNotes", QueryInput: input, QueryOutput: model.Note{}})
	graphQuery := utils.GenerateGraphQLQueryWithMultipleFunction("query", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphQuery)	
}

func CreateNote(w http.ResponseWriter, r *http.Request, noteService *services.NoteService) {
	filePath, fileObject, err := controller_utils.ReceiveMultipartFile(r, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Println("File path:", filePath)

	userId := fmt.Sprintf("%.0f", r.Context().Value(middleware.ContextKeyUserId))
	input, err := mapper.CreateNoteRequestDTOMapper(r, fileObject, userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Println("Input:", input)

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "createNote", QueryInput: input, QueryOutput: model.Note{}})
	graphQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphQuery)
}

func LockNote(w http.ResponseWriter, r *http.Request, noteService *services.NoteService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	noteId := chi.URLParam(r, "id")

	input := mapper.LockNoteRequestDTOMapper(body, noteId)
	if input == nil {
		http.Error(w, "Note ID does not match", http.StatusBadRequest)
		return
	}

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "lockNote", QueryInput: input, QueryOutput: model.Note{}})
	graphQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphQuery)
}

func UnlockNote(w http.ResponseWriter, r *http.Request, noteService *services.NoteService) {
	var body map[string]interface{}
	body, err := controller_utils.MappingBody(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	noteId := chi.URLParam(r, "id")

	input := mapper.UnlockNoteRequestDTOMapper(body, noteId)
	if input == nil {
		http.Error(w, "Note ID does not match", http.StatusBadRequest)
		return
	}

	graphqlQueryModel := []base_dtos.GraphQLQuery{}
	graphqlQueryModel = append(graphqlQueryModel, base_dtos.GraphQLQuery{FunctionName: "unlockNote", QueryInput: input, QueryOutput: model.Note{}})
	graphQuery := utils.GenerateGraphQLQueryWithMultipleFunction("mutation", graphqlQueryModel)

	utils.ConnectToGraphQLServer(w, graphQuery)
}

func DeleteNoteById(w http.ResponseWriter, r *http.Request, noteService *services.NoteService) {
	noteId := chi.URLParam(r, "id")
	noteService.DeleteNoteById(noteId)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode("Note deleted successfully"); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func GetNoteById(w http.ResponseWriter, r *http.Request, noteService *services.NoteService) {
    noteId := chi.URLParam(r, "id")
    note, err := noteService.GetNoteById(noteId)
    if err != nil {
        log.Printf("Error getting note: %v", err)
        http.Error(w, "Failed to get note", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(note); err != nil {
        log.Printf("Error encoding final response: %v", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
    }
}

func UpdateNote(w http.ResponseWriter, r *http.Request, noteService *services.NoteService) {
	filePath, fileObject, err := controller_utils.ReceiveMultipartFile(r, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Println("File path:", filePath)	

	noteId := chi.URLParam(r, "id")
	input := mapper.UpdateNoteRequestDTOMapper(r, fileObject, noteId)
	log.Println("Input:", input)

	note, err := noteService.UpdateNote(*input)
	if err != nil {
		log.Printf("Error updating note: %v", err)
		http.Error(w, "Failed to update note", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(note); err != nil {
		log.Printf("Error encoding final response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}