package response_dtos

import (
	"middleware_loader/infrastructure/graph/model"

	"github.com/devfeel/mapper"
)

type AuthTokenResponseDTO struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	Name         string `json:"name"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	LastLogin    string `json:"lastLogin"`
	BossType     string `json:"bossType"`
	Role         string `json:"role"`
	GaiaHealth   string `json:"gaiaHealth"`
}

func NewSigninResponseDTO() *AuthTokenResponseDTO {
	return &AuthTokenResponseDTO{}
}

// mapper from dto to graphql model
func (in *AuthTokenResponseDTO) MapperToGraphQLModel(input AuthTokenResponseDTO) model.AuthTokenResponse {
	var out model.AuthTokenResponse
	mapper.AutoMapper(&input, &out)
	return out
}

type GaiaTokenResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type TokenResponse struct {
	Id          float64 `json:"id"`
	Username    string  `json:"username"`
	AccessToken string  `json:"accessToken"`
	ExpiryDate  string  `json:"expiryDate"`
	Valid       bool    `json:"valid"`
}
