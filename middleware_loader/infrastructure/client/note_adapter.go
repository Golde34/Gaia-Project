package client_adapter

import (
	"fmt"
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	mapper_response "middleware_loader/core/port/mapper/response"
	"middleware_loader/infrastructure/client/base"
	"middleware_loader/infrastructure/graph/model"
	"middleware_loader/kernel/utils"
)

type NoteAdapter struct {
	CreateNoteRequestDTO request_dtos.CreateNoteRequestDTO
}

func NewNoteAdapter() *NoteAdapter {
	return &NoteAdapter{}
}

func (adapter *NoteAdapter) GetAllNotes(userId string) ([]response_dtos.NoteResponseDTO, error) {
	listAllNotesURL := base.TaskManagerServiceURL + "/note/" + userId
	var notes []response_dtos.NoteResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPI(listAllNotesURL, "GET", nil, headers)

	if err != nil {
		return []response_dtos.NoteResponseDTO{}, err
	}

	bodyResultMap, ok := result.(map[string]interface{})
	if !ok {
		return []response_dtos.NoteResponseDTO{}, nil
	}
	for _, noteElement := range bodyResultMap["message"].([]interface{}) {
		note := mapper_response.ReturnNoteObjectMapper(noteElement.(map[string]interface{}))
		notes = append(notes, *note)
	}

	return notes, nil
}

func (adapter *NoteAdapter) CreateNote(input model.CreateNoteInput) (response_dtos.NoteResponseDTO, error) {
	createNoteURL := base.TaskManagerServiceURL + "/note/create"
	var note response_dtos.NoteResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPIV2(createNoteURL, "POST", input, &note, headers)
	if err != nil {
		return response_dtos.NoteResponseDTO{}, err
	}

	noteResponse, ok := result.(*response_dtos.NoteResponseDTO)
	if !ok {
		return response_dtos.NoteResponseDTO{}, fmt.Errorf("unexpected response type")
	}
	return *noteResponse, nil
}

func (adapter *NoteAdapter) UpdateNoteFileStatus(noteId string, fileName string) (response_dtos.NoteResponseDTO, error) {
	updateNoteFileStatusURL := base.TaskManagerServiceURL + "/note/update-file-status/" + noteId
	var request request_dtos.UpdateNoteFileStatusRequestDTO
	request.FileName = fileName
	var note response_dtos.NoteResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPIV2(updateNoteFileStatusURL, "PUT", request, &note, headers)
	if err != nil {
		return response_dtos.NoteResponseDTO{}, err
	}

	noteResponse, ok := result.(*response_dtos.NoteResponseDTO)
	if !ok {
		return response_dtos.NoteResponseDTO{}, fmt.Errorf("unexpected response type")
	}
	return *noteResponse, nil
}

func (adapter *NoteAdapter) LockNote(input model.LockNoteInput) (response_dtos.NoteResponseDTO, error) {
	lockNoteURL := base.TaskManagerServiceURL + "/note/lock/" + input.NoteID
	var note response_dtos.NoteResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPIV2(lockNoteURL, "PUT", input, note, headers)
	if err != nil {
		return response_dtos.NoteResponseDTO{}, err
	}

	noteResponse, ok := result.(*response_dtos.NoteResponseDTO)
	if !ok {
		return response_dtos.NoteResponseDTO{}, fmt.Errorf("unexpected response type")
	}
	return *noteResponse, nil
}

func (adapter *NoteAdapter) UnlockNote(input model.UnlockNoteInput) (response_dtos.NoteResponseDTO, error) {
	unlockNoteURL := base.TaskManagerServiceURL + "/note/unlock/" + input.NoteID
	var note response_dtos.NoteResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPIV2(unlockNoteURL, "PUT", input, note, headers)
	if err != nil {
		return response_dtos.NoteResponseDTO{}, err
	}

	noteResponse, ok := result.(*response_dtos.NoteResponseDTO)
	if !ok {
		return response_dtos.NoteResponseDTO{}, fmt.Errorf("unexpected response type")
	}
	return *noteResponse, nil
}

func (adapter *NoteAdapter) DeleteNote(id string) (response_dtos.NoteResponseDTO, error) {
	deleteNoteURL := base.TaskManagerServiceURL + "/note/" + id
	var note response_dtos.NoteResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPIV2(deleteNoteURL, "DELETE", nil, note, headers)
	if err != nil {
		return response_dtos.NoteResponseDTO{}, err
	}
	bodyResultMap, ok := result.(map[string]interface{})
	if !ok {
		return response_dtos.NoteResponseDTO{}, nil
	}
	noteResponse := mapper_response.ReturnNoteObjectMapper(bodyResultMap["message"].(map[string]interface{}))
	return *noteResponse, nil
}

func (adapter *NoteAdapter) GetNoteById(id string) (response_dtos.NoteResponseDTO, error) {
	getNoteURL := base.TaskManagerServiceURL + "/note/detail/" + id
	var note response_dtos.NoteResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPIV2(getNoteURL, "GET", nil, note, headers)
	if err != nil {
		return response_dtos.NoteResponseDTO{}, nil
	}
	bodyResultMap, ok := result.(map[string]interface{})
	if !ok {
		return response_dtos.NoteResponseDTO{}, nil
	}
	noteResponse := mapper_response.ReturnNoteObjectMapper(bodyResultMap["message"].(map[string]interface{}))
	return *noteResponse, nil
}

func (adapter *NoteAdapter) UpdateNote(request request_dtos.UpdateNoteRequestDTO) (response_dtos.NoteResponseDTO, error) {
	updateNoteURL := base.TaskManagerServiceURL + "/note/update/" + request.NoteId
	var note response_dtos.NoteResponseDTO
	headers := utils.BuildDefaultHeaders()
	result, err := utils.BaseAPIV2(updateNoteURL, "PUT", request, note, headers)
	if err != nil {
		return response_dtos.NoteResponseDTO{}, nil
	}
	bodyResultMap, ok := result.(map[string]interface{})
	if !ok {
		return response_dtos.NoteResponseDTO{}, nil
	}
	noteResponse := mapper_response.ReturnNoteObjectMapper(bodyResultMap["message"].(map[string]interface{}))
	return *noteResponse, nil
}