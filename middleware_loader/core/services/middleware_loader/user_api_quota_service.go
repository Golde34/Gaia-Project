package services

import (
	"context"
	_ "embed"
	"fmt"
	"log"
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/core/domain/entity"
	"middleware_loader/core/port/store"
	redis_cache "middleware_loader/infrastructure/cache"
	database_mongo "middleware_loader/kernel/database/mongo"
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
	quotaStore     store.UserApiQuotaStore
}

func NewUserApiQuotaService(db database_mongo.Database) *UserApiQuotaService {
	service := &UserApiQuotaService{
		actionHandlers: make(map[string]ActionHandler),
		quotaStore:     store.NewUserApiQuotaStore(db),
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

	// Execute action handler if registered
	if handler, exists := s.actionHandlers[actionType]; exists {
		go func() {
			if err := handler(ctx, userId, actionType, payload); err != nil {
				log.Printf("❌ Handler failed: %v", err)
				s.rollbackQuota(context.Background(), redisKey)
			} else {
				// Success: Update MongoDB
				s.syncQuotaToDatabase(context.Background(), userId, actionType)
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

// syncQuotaToDatabase syncs the quota usage to MongoDB after successful operation
func (s *UserApiQuotaService) syncQuotaToDatabase(ctx context.Context, userId string, actionType string) {
	today := utils.GetTodayDateString()

	// Check if quota record exists in MongoDB
	query := request_dtos.UserApiQuotaQueryRequest{
		UserId:     userId,
		ActionType: actionType,
		QuotaDate:  today,
	}

	result := s.quotaStore.GetUserApiQuota(ctx, query)
	var existingQuota entity.UserApiQuota
	err := result.Decode(&existingQuota)

	if err != nil {
		// Record doesn't exist, create new one with remaining count from Redis
		remaining, _ := s.GetQuotaUsage(ctx, userId, actionType)
		insertRequest := request_dtos.UserApiQuotaInsertRequest{
			UserId:         userId,
			ActionType:     actionType,
			RemainingCount: remaining,
		}
		_, err := s.quotaStore.InsertUserApiQuota(ctx, insertRequest)
		if err != nil {
			log.Printf("❌ Failed to insert quota to MongoDB: %v", err)
		} else {
			log.Printf("✅ Quota synced to MongoDB (new record): user=%s actionType=%s remaining=%d", userId, actionType, remaining)
		}
	} else {
		// Record exists, decrease quota in MongoDB
		err := s.quotaStore.DecreaseUserApiQuota(ctx, userId, actionType)
		if err != nil {
			log.Printf("❌ Failed to decrease quota in MongoDB: %v", err)
		} else {
			log.Printf("✅ Quota decreased in MongoDB: user=%s actionType=%s", userId, actionType)
		}
	}
}
