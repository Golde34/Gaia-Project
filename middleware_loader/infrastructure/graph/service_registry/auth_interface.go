package service_registry

import (
	"context"

	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/infrastructure/graph/model"
)

type AuthService interface {
	Signin(ctx context.Context, input model.SigninInput) (model.AuthTokenResponse, response_dtos.AuthTokenResponseDTO, error)
	GaiaAutoSignin(ctx context.Context, input model.SigninInput) (model.AuthTokenResponse, error)
	CheckToken(ctx context.Context, input model.TokenInput) (model.TokenResponse, error)
}