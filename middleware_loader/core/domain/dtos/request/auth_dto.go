package request_dtos

import (
	"middleware_loader/infrastructure/graph/model"

	"github.com/devfeel/mapper"
)

type AuthDTO struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func NewAuthDTO() *AuthDTO {
	return &AuthDTO{}
}

func (in *AuthDTO) MapperToModel(input model.SigninInput) {
	mapper.AutoMapper(&input, in)
}

type TokenInputDTO struct {
	Token string `json:"token"`
}

func NewTokenInputDTO() *TokenInputDTO {
	return &TokenInputDTO{}
}

func (in *TokenInputDTO) MapperToModel(input model.TokenInput) {
	mapper.AutoMapper(&input, in)
}

type SignupDTO struct {
	Name             string `json:"name"`
	Username         string `json:"username"`
	Email            string `json:"email"`
	Password         string `json:"password"`
	MatchingPassword string `json:"matchingPassword"`
}

func NewSignupDTO() *SignupDTO {
	return &SignupDTO{}
}
