package redis_cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	cache "github.com/patrickmn/go-cache"
)

const cacheInvalidationChannel = "cache_invalidation"

var (
	memoryCache *cache.Cache
	mu          sync.RWMutex
)

func init() {
	memoryCache = cache.New(5*time.Minute, 10*time.Minute)
}

func ListenInvalidation(ctx context.Context) {
	pubsub := Client().Subscribe(ctx, cacheInvalidationChannel)
	defer pubsub.Close()

	ch := pubsub.Channel()
	log.Println("Local Cache is listening for invalidations...")

	for msg := range ch {
		memoryCache.Delete(msg.Payload)
		log.Printf("Invalidated local cache for key: %s", msg.Payload)
	}
}

func GetLocal(ctx context.Context, key string, dest interface{}) (bool, error) {
	if val, found := memoryCache.Get(key); found {
		data, err := json.Marshal(val)
		if err != nil {
			return true, nil
		}
		return true, json.Unmarshal(data, dest)
	}

	val, err := Client().Get(ctx, key).Result()
	if err != nil {
		return false, nil
	}

	err = json.Unmarshal([]byte(val), dest)
	if err != nil {
		return false, fmt.Errorf("failed to unmarshal redis data: %w", err)
	}

	memoryCache.Set(key, dest, cache.DefaultExpiration)

	return true, nil
}

func SetHybridLocal(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	err := Client().Set(ctx, key, value, expiration).Err()
	if err != nil {
		return err
	}

	return Client().Publish(ctx, cacheInvalidationChannel, key).Err()
}

func DeleteLocal(ctx context.Context, key string) error {
	err := Client().Del(ctx, key).Err()
	if err != nil {
		return err
	}

	memoryCache.Delete(key)

	return Client().Publish(ctx, cacheInvalidationChannel, key).Err()
}

func UpdateLocal(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	DeleteLocal(ctx, key)
	return SetHybridLocal(ctx, key, value, expiration)
}
