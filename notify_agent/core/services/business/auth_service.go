package services

import (
	redis_cache "notify_agent/infrastructure/cache"
	"context"
	"log"
	"notify_agent/core/domain/constants"
	"notify_agent/infrastructure/client"
	"time"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) ValidateJwt(ctx context.Context, jwt string) (string, error) {
	// get jwt from redis
	key := constants.RedisPrefix + constants.ValidateServiceJwt + jwt
	existedUserChatHub, err := redis_cache.GetKey(ctx, key)
	if err == nil && existedUserChatHub != "" {
		log.Println("JWT found in Redis: ", existedUserChatHub)
		return existedUserChatHub, nil
	}
	// if not exists call auth service to validate
	userId, err := client.NewAuthAdapter().ValidateServiceJwt(jwt)
	if err != nil {
		return "", err
	}
	go s.buildValidateServiceJwt(ctx, key, userId)
	return userId, nil

}

func (s *AuthService) buildValidateServiceJwt(ctx context.Context, key, jwt string) error {
	// All of service jst ttl is 1 hour
	redis_cache.SetKeyWithTTL(ctx, key, jwt, time.Duration(1)*time.Hour)
	log.Println("Set service JWT in Redis of key: ", key, " successfully")
	return nil
}
