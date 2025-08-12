package services

import (
	"chat_hub/core/domain/constants"
	response_dtos "chat_hub/core/domain/dtos/response"
	redis_cache "chat_hub/infrastructure/cache"
	"chat_hub/infrastructure/client"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type AuthService struct{
	authClient *client.AuthAdapter
}

func NewAuthService() *AuthService {
	return &AuthService{
		authClient: client.NewAuthAdapter(),
	}
}

func (s *AuthService) ValidateJwt(ctx context.Context, jwt string) (string, error) {
	key := constants.RedisPrefix + constants.ValidateServiceJwt + jwt
	existedUserChatHub, err := redis_cache.GetKey(ctx, key)
	if err == nil && existedUserChatHub != "" {
		log.Println("JWT found in Redis: ", existedUserChatHub)
		return existedUserChatHub, nil
	}

	userId, err := s.authClient.ValidateServiceJwt(jwt)
	if err != nil {
		return "", err
	}
	go s.buildValidateServiceJwt(ctx, key, userId)
	return userId, nil

}

func (s *AuthService) buildValidateServiceJwt(ctx context.Context, key, jwt string) error {
	redis_cache.SetKeyWithTTL(ctx, key, jwt, time.Duration(1)*time.Hour)
	log.Println("Set service JWT in Redis of key: ", key, " successfully")
	return nil
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

	tokenResponse, err := s.authClient.CheckToken(accessToken)
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
	newAccessToken, err := s.authClient.RefreshToken(refreshToken)
	if err != nil {
		return "", err
	} else {
		return newAccessToken, nil
	}
}