package redis_cache

import (
	"context"
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

func Get(ctx context.Context, key string) (interface{}, bool) {
	if val, found := memoryCache.Get(key); found {
		return val, true
	}

	val, err := Client().Get(ctx, key).Result()
	if err == nil {
		memoryCache.Set(key, val, cache.DefaultExpiration)
		return val, true
	}

	return nil, false
}

func SetHybrid(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	err := Client().Set(ctx, key, value, expiration).Err()
	if err != nil {
		return err
	}

	return Client().Publish(ctx, cacheInvalidationChannel, key).Err()
}

func Delete(ctx context.Context, key string) error {
	err := Client().Del(ctx, key).Err()
	if err != nil {
		return err
	}

	memoryCache.Delete(key)

	return Client().Publish(ctx, cacheInvalidationChannel, key).Err()
}

func Update(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	Delete(ctx, key)
	return SetHybrid(ctx, key, value, expiration)
}
