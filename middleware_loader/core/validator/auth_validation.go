package validator

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"

	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/core/domain/enums"
	"middleware_loader/infrastructure/graph/model"
)

type AuthValidator struct {
	AuthDTO       request_dtos.AuthDTO
	TokenInputDTO request_dtos.TokenInputDTO
	SignupDTO     request_dtos.SignupDTO
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

func (in *AuthValidator) ValidateSignup(input request_dtos.SignupDTO) error {
	username := strings.TrimSpace(input.Username)
	name := strings.TrimSpace(input.Name)
	email := strings.TrimSpace(input.Email)
	password := strings.TrimSpace(input.Password)
	matchingPassword := strings.TrimSpace(input.MatchingPassword)

	if username == "" { 
		return fmt.Errorf("%w: username is required", enums.ErrValidation)
	}
	if name == "" {
		return fmt.Errorf("%w: name is required", enums.ErrValidation)
	}
	if email == "" {
		return fmt.Errorf("%w: email is required", enums.ErrValidation)
	}
	if password == "" {
		return fmt.Errorf("%w: password is required", enums.ErrValidation)
	}

	if len(username) < 3 || len(username) > 20 {
		return fmt.Errorf("%w: username must be between 3 and 20 characters", enums.ErrValidation)
	}
	if len(name) < 3 || len(name) > 50 {
		return fmt.Errorf("%w: name must be between 3 and 50 characters", enums.ErrValidation)
	}
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(strings.ToLower(email)) {
		return fmt.Errorf("%w: invalid email format", enums.ErrValidation)
	}
	var hasDigit, hasUpper bool
	for _, char := range password {
		switch {
			case unicode.IsDigit(char):
				hasDigit = true
			case unicode.IsUpper(char):
				hasUpper = true
		}
	}

	if len(password) < 8 {
		return fmt.Errorf("%w: password must be at least 8 characters long", enums.ErrValidation)
	}
	if !hasDigit {
		return fmt.Errorf("%w: password must contain at least one digit", enums.ErrValidation)
	}
	if !hasUpper {
		return fmt.Errorf("%w: password must contain at least one uppercase letter", enums.ErrValidation)
	}
	if password != matchingPassword {
		return fmt.Errorf("%w: passwords do not match", enums.ErrValidation)
	}
	return nil
}
