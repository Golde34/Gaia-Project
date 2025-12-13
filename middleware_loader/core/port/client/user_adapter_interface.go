package client

import (
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/infrastructure/graph/model"
)

type IUserAdapter interface {
	ListAllUsers() ([]response_dtos.UserDTO, error)
	UpdateUser(user model.UpdateUserInput) (response_dtos.UserDTO, error)
	GetUserDetail(input model.IDInput) (response_dtos.UserDetailDTO, error)
	UpdateUserSetting(updateUserSetting model.UpdateUserSettingInput) (response_dtos.UserSettingDTO, error)
	GetAllModels() ([]response_dtos.LLMModel, error)
	UpdateUserModel(input request_dtos.UpdateUserModelRequestDTO) (string, error)
	GetUserModels(userId string) ([]response_dtos.UserLLMModel, error)
	UpsertUserLLMModel(input request_dtos.UpsertUserLLMModelRequestDTO) (string, error)
	DeleteUserModel(id string) error
	UpdateMemoryModel(memoryModel string, userId int) (string, error)
	GetMemoryModel(userId string) (string, error)
}
