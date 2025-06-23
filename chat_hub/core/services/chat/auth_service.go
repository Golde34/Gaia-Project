package services

import (
	"chat_hub/core/domain/constants"
	redis_cache "chat_hub/infrastructure/cache"
	"chat_hub/infrastructure/client"
	"context"
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
