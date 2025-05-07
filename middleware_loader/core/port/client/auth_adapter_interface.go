package client 

import (
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/infrastructure/graph/model"
)

type IAuthAdapter interface {
	Signin(input model.SigninInput) (response_dtos.AuthTokenResponseDTO, error)
	GaiaAutoSignin(input model.SigninInput) (response_dtos.AuthTokenResponseDTO, error)
	CheckToken(token string) (response_dtos.TokenResponse, error)
	RefreshToken(refreshToken string) (string, error)
	GetServiceJWT(serviceName, userId string) (string, error)
}