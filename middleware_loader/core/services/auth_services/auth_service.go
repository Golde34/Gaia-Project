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

type AuthService struct {
	SigninInput request_dtos.AuthDTO
}

func NewAuthService() *AuthService {
	return &AuthService{}
}

var authValidator = validator.NewAuthDTOValidator()
var signinResponesDTO = response_dtos.NewSigninResponseDTO()

func (s *AuthService) Signin(ctx context.Context, input model.SigninInput) (model.AuthTokenResponse, response_dtos.AuthTokenResponseDTO, error) {
	err := authValidator.AuthValidate(input)
	if err != nil {
		return model.AuthTokenResponse{}, response_dtos.AuthTokenResponseDTO{}, err 
	}	
	log.Println("Validation passed!")

	authTokenResponse , err := client.IAuthAdapter(&adapter.AuthAdapter{}).Signin(input)
	if err != nil {
		return model.AuthTokenResponse{}, response_dtos.AuthTokenResponseDTO{}, err 
	} else {
		modelSigninResponse := signinResponesDTO.MapperToGraphQLModel(authTokenResponse)
		return modelSigninResponse, authTokenResponse, nil
	}	
}

func (s *AuthService) GaiaAutoSignin(ctx context.Context, input model.SigninInput) (model.AuthTokenResponse, error) {
	err := authValidator.AuthValidate(input)
	if err != nil {
		return model.AuthTokenResponse{}, err
	}
	log.Println("Validation passed!")

	authTokenResponse , err := client.IAuthAdapter(&adapter.AuthAdapter{}).GaiaAutoSignin(input)
	if err != nil {
		return model.AuthTokenResponse{}, err
	} else {
		authTokenResponse := signinResponesDTO.MapperToGraphQLModel(authTokenResponse)
		return authTokenResponse, nil
	}	
}

func (s *AuthService) CheckToken(ctx context.Context, input model.TokenInput) (model.TokenResponse, error) {
	err := authValidator.TokenValidate(input)
	if err != nil {
		return model.TokenResponse{}, err
	}
	log.Println("Validation passed!")

	tokenResponse , err := client.IAuthAdapter(&adapter.AuthAdapter{}).CheckToken(input)
	if err != nil {
		return model.TokenResponse{}, err
	} else {
		return tokenResponse, nil
	}
}