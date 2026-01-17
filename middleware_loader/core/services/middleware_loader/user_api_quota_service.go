package services

import (
	"context"
	_ "embed"
	"fmt"
	"log"
	redis_cache "middleware_loader/infrastructure/cache"
	"middleware_loader/kernel/utils"
)

var luaScript string

type ActionHandler func(
	ctx context.Context,
	userId string,
	actionType string,
	payload map[string]interface{}) error

type UserApiQuotaService struct {
	actionHandlers map[string]ActionHandler
}

func NewUserApiQuotaService() *UserApiQuotaService {
	service := &UserApiQuotaService{
		actionHandlers: make(map[string]ActionHandler),
	}
	return service
}

func (s *UserApiQuotaService) RegisterActionHandler(actionType string, handler ActionHandler) {
	s.actionHandlers[actionType] = handler
}

func (s *UserApiQuotaService) CheckAndDecreaseQuota(
	ctx context.Context,
	userId string,
	actionType string,
	maxCount int,
	payload map[string]interface{},
) (int, error) {
	today := utils.GetTodayDateString()
	redisKey := fmt.Sprintf("usage:%s:%s:%s", userId, actionType, today)

	result, err := redis_cache.ExecuteLuaScript(
		ctx,
		luaScript,
		[]string{redisKey},
		maxCount,
	)
	if err != nil {
		return -1, fmt.Errorf("failed to execute Lua script: %w", err)
	}

	remaining, ok := result.(int64)
	if !ok {
		return -1, fmt.Errorf("unexpected result type from Lua script")
	}

	if remaining < 0 {
		log.Printf("Quota exceeded for user=%s actionType=%s", userId, actionType)
		return int(remaining), fmt.Errorf("quota exceeded: too many requests")
	}

	log.Printf("Quota decreased: user=%s actionType=%s remaining=%d", userId, actionType, remaining)

	if handler, exists := s.actionHandlers[actionType]; exists {
		go func() {
			if err := handler(ctx, userId, actionType, payload); err != nil {
				s.rollbackQuota(context.Background(), redisKey)
			}
		}()
	}

	return int(remaining), nil
}

func (s *UserApiQuotaService) rollbackQuota(ctx context.Context, redisKey string) {
	_, err := redis_cache.Incr(ctx, redisKey)
	if err != nil {
		log.Printf("Failed to rollback quota for key=%s: %v", redisKey, err)
	} else {
		log.Printf("Quota rolled back successfully for key=%s", redisKey)
	}
}

func (s *UserApiQuotaService) GetQuotaUsage(ctx context.Context, userId string, actionType string) (int, error) {
	today := utils.GetTodayDateString()
	redisKey := fmt.Sprintf("usage:%s:%s:%s", userId, actionType, today)

	result, err := redis_cache.GetKey(ctx, redisKey)
	if err != nil {
		return 0, nil
	}

	var remaining int
	fmt.Sscanf(result, "%d", &remaining)
	return remaining, nil
}
