package services

import (
	"context"
	_ "embed"
	"fmt"
	"log"
	base_dtos "middleware_loader/core/domain/dtos/base"
	request_dtos "middleware_loader/core/domain/dtos/request"
	"middleware_loader/core/domain/entity"
	"middleware_loader/core/domain/enums"
	"middleware_loader/core/port/store"
	redis_cache "middleware_loader/infrastructure/cache"
	"middleware_loader/infrastructure/kafka"
	"middleware_loader/kernel/configs"
	database_mongo "middleware_loader/kernel/database/mongo"
	"middleware_loader/kernel/resource"
	"middleware_loader/kernel/utils"
	"strconv"
)

type UserApiQuotaService struct {
	quotaStore store.UserApiQuotaStore
	config     configs.Config
}

func NewUserApiQuotaService(db database_mongo.Database) *UserApiQuotaService {
	return &UserApiQuotaService{
		quotaStore: store.NewUserApiQuotaStore(db),
		config:     configs.Config{},
	}
}

// BUSINESS LOGIC FUNCTIONS
func (s *UserApiQuotaService) SyncProjectMemory(ctx context.Context, userId string) (base_dtos.ErrorResponse, error) {
	payload := map[string]interface{}{
		"userId": userId,
	}

	cfg, _ := s.config.LoadEnv()
	maxQuotaStr := cfg.SyncProjectQuota
	maxQuota, err := strconv.Atoi(maxQuotaStr)
	if err != nil {
		maxQuota = 1
	}
	redisTtl := 4 * 60 * 60 // 4 hours in seconds
	return s.CheckApiQuota(
		ctx,
		maxQuota,
		userId,
		enums.SYNC_PROJECT_ACTION,
		func(p interface{}) (interface{}, bool, error) {
			return s.HandleSyncProject(p)
		},
		payload,
		strconv.Itoa(redisTtl))
}

func (s *UserApiQuotaService) HandleSyncProject(payload interface{}) (interface{}, bool, error) {
	// call kafka
	kafka.ProduceKafkaMessage(payload.(map[string]interface{}),
		enums.SynchronizeMemoryTopic, enums.SyncProjectCmd)
	response := "ok"
	return response, false, nil
}

// GENERIC FUNCTIONS
func (s *UserApiQuotaService) CheckApiQuota(
	ctx context.Context,
	maxQuota int,
	userId, actionType string,
	function func(interface{}) (interface{}, bool, error),
	payload interface{},
	ttl string,
) (base_dtos.ErrorResponse, error) {
	redisKey := fmt.Sprintf("%s:%s:%s:%s", enums.RedisPrefix, actionType, userId, utils.GetTodayDateString())

	_, err := s.checkAndDecreaseQuota(ctx, userId, actionType, maxQuota, redisKey, ttl)
	if err != nil {
		return utils.ReturnErrorResponse(429, "Quota exceeded"), nil
	}

	response, isAsync, err := function(payload)
	if err != nil {
		s.RollbackQuota(ctx, redisKey)
		return utils.ReturnErrorResponse(500, fmt.Sprintf("Cannot process %s request", actionType)), nil
	}

	if !isAsync {
		s.syncQuotaToDatabase(context.Background(), userId, actionType)
		return utils.ReturnSuccessResponse(fmt.Sprintf("%s request success ", actionType), response), nil
	}

	return utils.ReturnSuccessResponse("Sync project request accepted for processing", response), nil

}

func (s *UserApiQuotaService) checkAndDecreaseQuota(
	ctx context.Context,
	userId string,
	actionType string,
	maxCount int,
	redisKey string,
	ttl string,
) (int, error) {
	result, err := redis_cache.ExecuteLuaScript(
		ctx,
		resource.RateLimitScript,
		[]string{redisKey},
		maxCount,
		ttl,
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

	return int(remaining), nil
}

func (s *UserApiQuotaService) RollbackQuota(ctx context.Context, redisKey string) {
	_, err := redis_cache.Incr(ctx, redisKey)
	if err != nil {
		log.Printf("Failed to rollback quota for key=%s: %v", redisKey, err)
	} else {
		log.Printf("Quota rolled back successfully for key=%s", redisKey)
	}
}

func (s *UserApiQuotaService) GetQuotaUsage(ctx context.Context, userId string, actionType string) (int, error) {
	redisKey := fmt.Sprintf("%s:%s:%s:%s", enums.RedisPrefix, actionType, userId, utils.GetTodayDateString())

	result, err := redis_cache.GetKey(ctx, redisKey)
	if err != nil {
		return 0, nil
	}

	var remaining int
	fmt.Sscanf(result, "%d", &remaining)
	return remaining, nil
}

func (s *UserApiQuotaService) syncQuotaToDatabase(ctx context.Context, userId string, actionType string) {
	query := request_dtos.UserApiQuotaQueryRequest{
		UserId:     userId,
		ActionType: actionType,
		QuotaDate:  utils.GetTodayDateString(),
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
		s.quotaStore.InsertUserApiQuota(ctx, insertRequest)
	} else {
		// Record exists, decrease quota in MongoDB
		err := s.quotaStore.DecreaseUserApiQuota(ctx, userId, actionType)
		println("Decreased quota in MongoDB:", err)
	}
}
