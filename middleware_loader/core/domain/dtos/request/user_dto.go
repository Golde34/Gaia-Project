package request_dtos

import (
	"middleware_loader/infrastructure/graph/model"

	"github.com/devfeel/mapper"
)

type UpdateUserRequestDTO struct {
	UserId   float64  `json:"userId"`
	Name     string   `json:"name"`
	Username string   `json:"username"`
	Email    string   `json:"email"`
	Roles    []string `json:"roles"`
}

func (in *UpdateUserRequestDTO) MapperToModel(input model.UpdateUserInput) {
	mapper.AutoMapper(&input, in)
}
func NewUpdateUserRequestDTO() *UpdateUserRequestDTO {
	return &UpdateUserRequestDTO{}
}

type UserIdInputDTO struct {
	UserId float64 `json:"userId"`
}

func (in *UserIdInputDTO) MapperToModel(input model.RegisterTaskInput) {
	mapper.AutoMapper(&input, in)
}

func NewUserIdInputDTO() *UserIdInputDTO {
	return &UserIdInputDTO{}
}

type UpdateUserSettingRequestDTO struct {
	UserId               float64 `json:"userId"`
	OptimizedTaskConfig  float64 `json:"optimizedTaskConfig"`
	PrivateProfileConfig float64 `json:"privateProfileConfig"`
	TaskSortingAlgorithm float64 `json:"taskSortingAlgorithm"`
	AutoOptimizeConfig   float64 `json:"autoOptimizeConfig"`
}

func NewUpdateUserSettingRequestDTO() *UpdateUserSettingRequestDTO {
	return &UpdateUserSettingRequestDTO{}
}

func (in *UpdateUserSettingRequestDTO) MapperToModel(input model.UpdateUserSettingInput) {
	mapper.AutoMapper(&input, in)
}

type UpdateUserModelRequestDTO struct {
	UserId  float64 `json:"userId"`
	ModelId float64 `json:"modelId"`
}

func NewUpdateUserModelRequestDTO() *UpdateUserModelRequestDTO {
	return &UpdateUserModelRequestDTO{}
}
