package mapper

import (
	"fmt"
	base_dtos "middleware_loader/core/domain/dtos/base"
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/kernel/utils"
	"net/http"
	"strconv"
)

func CreateNoteRequestDTOMapper(r *http.Request, fileObject base_dtos.FileObject) (*request_dtos.CreateNoteRequestDTO, error) {
	var input request_dtos.CreateNoteRequestDTO
	// Extract "name" from the form data
	name := r.FormValue("name")
	if name == "" {
		input.Name = ""	
	}
	input.Name = name
	
	// Extract "userId" from the form data
	userIdStr := r.FormValue("userId")
	userId, err := strconv.Atoi(userIdStr)
	if err != nil {
		return nil, fmt.Errorf("userId is required")
	}
	input.OwnerId = float64(userId) 

	input.FileId = fileObject.FileId 
	input.FileName = fileObject.FileName
	input.SummaryDisplayText = fileObject.FileContent
	return &input, nil
}

func UpdateNoteRequestDTOMapper(r *http.Request, fileObject base_dtos.FileObject, noteId string) *request_dtos.UpdateNoteRequestDTO {
	var input request_dtos.UpdateNoteRequestDTO
	name := r.FormValue("name")
	if name == "" {
		input.Name = ""	
	}
	input.Name = name
	input.NoteId = noteId
	input.FileId = fileObject.FileId
	input.FileName = fileObject.FileName
	input.SummaryDisplayText = fileObject.FileContent
	return &input
}	

func LockNoteRequestDTOMapper(body map[string]interface{}, noteId string) *request_dtos.LockNoteRequestDTO {
	var input request_dtos.LockNoteRequestDTO
	input.NoteId = utils.GetStringValue(body, "noteId", "")
	if noteId != input.NoteId {
		return nil
	}
	input.NotePassword = utils.GetStringValue(body, "notePassword", "")
	input.PasswordSuggestion = utils.GetStringValue(body, "passwordSuggestion", "")
	return &input
}

func UnlockNoteRequestDTOMapper(body map[string]interface{}, noteId string) *request_dtos.UnlockNoteRequestDTO {
	var input request_dtos.UnlockNoteRequestDTO
	input.NoteId = utils.GetStringValue(body, "noteId", "")
	if noteId != input.NoteId {
		return nil
	}
	input.NotePassword = utils.GetStringValue(body, "notePassword", "")
	return &input
}
