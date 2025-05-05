package validator

import (
	"fmt"

	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/core/domain/enums"
	"middleware_loader/infrastructure/graph/model"
)

type AuthValidator struct {
	AuthDTO request_dtos.AuthDTO
	TokenInputDTO request_dtos.TokenInputDTO
}

func NewAuthDTOValidator() *AuthValidator {
	return &AuthValidator{}
}

func (in *AuthValidator) AuthValidate(input model.SigninInput) error {
	in.AuthDTO.MapperToModel(input)
	if len(in.AuthDTO.Password) < 1 {
		return fmt.Errorf("%w: password is required", enums.ErrValidation)
	}

	if in.AuthDTO.Username == "" {
		return fmt.Errorf("%w: username is required", enums.ErrValidation)
	}

	return nil
}
