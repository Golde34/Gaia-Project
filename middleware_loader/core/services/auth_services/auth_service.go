package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	request_dtos "middleware_loader/core/domain/dtos/request"
	response_dtos "middleware_loader/core/domain/dtos/response"
	"middleware_loader/core/domain/enums"
	"middleware_loader/core/port/client"
	"middleware_loader/core/validator"
	redis_cache "middleware_loader/infrastructure/cache"
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

func (s *AuthService) Signup(ctx context.Context, input request_dtos.SignupDTO) (response_dtos.UserDetailDTO, string, error) {
	err := authValidator.ValidateSignup(input)
	if err != nil {
		log.Println("Validation error:", err)
		return response_dtos.UserDetailDTO{}, fmt.Sprint(err), nil
	}
	log.Println("Validation passed!")
	signupResponse, err := client.IAuthAdapter(&adapter.AuthAdapter{}).Signup(input)
	if err != nil {
		return response_dtos.UserDetailDTO{}, "Auth service problem", nil 
	}
	return signupResponse, "", nil 
}

func (s *AuthService) Signin(ctx context.Context, input model.SigninInput) (model.AuthTokenResponse, response_dtos.AuthTokenResponseDTO, error) {
	err := authValidator.AuthValidate(input)
	if err != nil {
		return model.AuthTokenResponse{}, response_dtos.AuthTokenResponseDTO{}, err
	}
	log.Println("Validation passed!")

	authTokenResponse, err := client.IAuthAdapter(&adapter.AuthAdapter{}).Signin(input)
	if err != nil {
		return model.AuthTokenResponse{}, response_dtos.AuthTokenResponseDTO{}, err
	}
	modelSigninResponse := signinResponesDTO.MapperToGraphQLModel(authTokenResponse)
	return modelSigninResponse, authTokenResponse, nil
}

func (s *AuthService) GaiaAutoSignin(ctx context.Context, input model.SigninInput) (model.AuthTokenResponse, error) {
	err := authValidator.AuthValidate(input)
	if err != nil {
		return model.AuthTokenResponse{}, err
	}
	log.Println("Validation passed!")

	authTokenResponse, err := client.IAuthAdapter(&adapter.AuthAdapter{}).GaiaAutoSignin(input)
	if err != nil {
		return model.AuthTokenResponse{}, err
	} else {
		authTokenResponse := signinResponesDTO.MapperToGraphQLModel(authTokenResponse)
		return authTokenResponse, nil
	}
}

func (s *AuthService) CheckToken(ctx context.Context, accessToken string) (response_dtos.TokenResponse, error) {
	existedUserAccessToken, err := redis_cache.GetKey(ctx, accessToken)
	if err == nil && existedUserAccessToken != "" {
		log.Println("Token found in Redis: ", existedUserAccessToken)
		var tr response_dtos.TokenResponse
		if err := json.Unmarshal([]byte(existedUserAccessToken), &tr); err != nil {
			return tr, err
		}
		return tr, nil
	}

	tokenResponse, err := client.IAuthAdapter(&adapter.AuthAdapter{}).CheckToken(accessToken)
	if err != nil {
		return response_dtos.TokenResponse{}, err
	}
	if !tokenResponse.Valid {
		log.Println("Token is not valid: ", tokenResponse)
		return response_dtos.TokenResponse{}, fmt.Errorf("token is not valid")
	}

	s.buildAccessTokenRedis(ctx, tokenResponse)

	return tokenResponse, nil
}

func (s *AuthService) buildAccessTokenRedis(ctx context.Context, tokenResponse response_dtos.TokenResponse) error {
	expiredTimeStamp, err := time.Parse(time.RFC3339, tokenResponse.ExpiryDate)
	if err != nil {
		return fmt.Errorf("failed to parse expiry date: %v", err)
	}
	ttl := time.Until(expiredTimeStamp).Seconds()
	tokenResponseInterface, err := json.Marshal(tokenResponse)
	if err != nil {
		return fmt.Errorf("failed to marshal token response: %v", err)
	}
	redis_cache.SetKeyWithTTL(ctx, tokenResponse.AccessToken, tokenResponseInterface, time.Duration(ttl)*time.Second)
	log.Println("Set token in Redis of username: ", tokenResponse.Username, " successfully")
	return nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (string, error) {
	newAccessToken, err := client.IAuthAdapter(&adapter.AuthAdapter{}).RefreshToken(refreshToken)
	if err != nil {
		return "", err
	} else {
		return newAccessToken, nil
	}
}

func (s *AuthService) GetServiceJWT(ctx context.Context, serviceName, userId string) (string, error) {
	key := enums.RedisPrefix + enums.GetServiceJwt + serviceName + "::" + userId
	existedServiceJWT, err := redis_cache.GetKey(ctx, key)
	log.Println("Get service JWT from redis: ", existedServiceJWT)
	log.Println("Get error from redis: ", err)
	if err == nil {
		log.Println("Service JWT found in Redis: ", existedServiceJWT)
		return existedServiceJWT, nil
	}
	serviceJWT, err := client.IAuthAdapter(&adapter.AuthAdapter{}).GetServiceJWT(serviceName, userId)
	if err != nil {
		return "", err
	}

	s.buildServiceJwtRedis(ctx, key, serviceJWT)

	return serviceJWT, nil
}

func (s *AuthService) buildServiceJwtRedis(ctx context.Context, key, jwt string) error {
	// All of service jst ttl is 1 hour
	redis_cache.SetKeyWithTTL(ctx, key, jwt, time.Duration(1)*time.Hour)
	log.Println("Set service JWT in Redis of key: ", key, " successfully")
	return nil
}
