package services

import (
	"context"
	"log"
	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/port/client"
	"middleware_loader/core/validator"
	adapter "middleware_loader/infrastructure/client"
	"middleware_loader/infrastructure/graph/model"
)

type UserService struct {
}

func NewUserService() *UserService {
	return &UserService{}
}

var userValidation = validator.NewUserDTOValidator()
var userResponse = response_dtos.NewUserDTO()
var userDetailResponse = response_dtos.NewUserDetailDTO()
var userSettingResponse = response_dtos.NewUserSettingDTO()

func (s *UserService) ListAllUsers(ctx context.Context) ([]model.ListAllUsers, error) {
	users, err := client.IUserAdapter(&adapter.UserAdapter{}).ListAllUsers()
	if err != nil {
		return nil, err
	}
	usersModel := userResponse.MapperListToGraphQLModel(users)
	return usersModel, nil
}

func (s *UserService) CreateUser(ctx context.Context, input model.CreateUserInput) (model.User, error) {
	err := userValidation.CreateUserValidate(input)
	if err != nil {
		return model.User{}, err
	}
	log.Println("Validation passed!")

	return model.User{}, nil
}

func (s *UserService) UpdateUser(ctx context.Context, input model.UpdateUserInput) (model.UpdateUser, error) {
	err := userValidation.UpdateUserValidate(input)
	if err != nil {
		return model.UpdateUser{}, err
	}
	log.Println("Validation passed!")

	user, err := client.IUserAdapter(&adapter.UserAdapter{}).UpdateUser(input)
	if err != nil {
		return model.UpdateUser{}, err
	} else {
		userModel := userResponse.UserMapperToGraphQLModel(user)
		return userModel, nil
	}
}

func (s *UserService) GetUserDetail(ctx context.Context, input model.IDInput) (model.UpdateUser, error) {
	user, err := client.IUserAdapter(&adapter.UserAdapter{}).GetUserDetail(input)
	if err != nil {
		return model.UpdateUser{}, err
	}
	
	userModel := userDetailResponse.MapperToGraphQLModelDetail(user)
	log.Println("User Detail: ", userModel.LlmModels[0].ModelName)
	return userModel, nil
}

func (s *UserService) UpdateUserSetting(ctx context.Context, input model.UpdateUserSettingInput) (model.UserSetting, error) {
	userSetting, err := client.IUserAdapter(&adapter.UserAdapter{}).UpdateUserSetting(input)
	if err != nil {
		return model.UserSetting{}, err
	}
	
	userSettingModel := userSettingResponse.MapperToGraphQLModelSetting(userSetting)
	return userSettingModel, nil
}

func (s *UserService) GetAllModels() ([]response_dtos.LLMModel, error) {
	models, err := client.IUserAdapter(&adapter.UserAdapter{}).GetAllModels()
	if err != nil {
		return nil, err
	}
	
	return models, nil
} 

func (s *UserService) UpdateUserModel(input request_dtos.UpdateUserModelRequestDTO) (string, error) {
	userModel, err := client.IUserAdapter(&adapter.UserAdapter{}).UpdateUserModel(input)
	if err != nil {
		return "Something error when update user model", err
	} else {
		return userModel, nil
	}
}

func (s *UserService) GetUserModels(userId string) ([]response_dtos.UserLLMModel, error) {
	userModels, err := client.IUserAdapter(&adapter.UserAdapter{}).GetUserModels(userId)
	if err != nil {
		return nil, err
	}
	return userModels, nil
}

func (s *UserService) UpsertUserModels(input request_dtos.UpsertUserLLMModelRequestDTO) (string, error) {
	userModel, err := client.IUserAdapter(&adapter.UserAdapter{}).UpsertUserLLMModel(input)
	if err != nil {
		return "Something error when upsert user model", err
	}
	return userModel, nil
}
