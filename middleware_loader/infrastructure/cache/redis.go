package redis_cache

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"middleware_loader/kernel/configs"

	"github.com/redis/go-redis/v9"
)

var (
    rdb  *redis.ClusterClient
    once sync.Once
)

func initClient() {
    redisConfig := configs.RedisConfig{}
    cfg, err := redisConfig.LoadEnv()
    if err != nil {
        panic(fmt.Sprintf("failed to load Redis config: %v", err))
    }
    rdb = redis.NewClusterClient(&redis.ClusterOptions{
        Addrs:     []string{fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)},
        Password: cfg.Password,
    })
}

func Client() *redis.ClusterClient{
    once.Do(initClient)
    return rdb
}

func SetKey(ctx context.Context, key string, value interface{}) error {
    return Client().Set(ctx, key, value, 0).Err()
}

func SetKeyWithTTL(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
    result := Client().Set(ctx, key, value, ttl).Err()
    log.Println("Set key in Redis: ", key, " with value: ", value, " and ttl: ", ttl)
    log.Println("Set error in Redis: ", result)
    return result
}

func GetKey(ctx context.Context, key string) (string, error) {
    return Client().Get(ctx, key).Result()
}

func DeleteKey(ctx context.Context, key string) error {
    _, err := Client().Del(ctx, key).Result()
    return err
}

func ExistsKey(ctx context.Context, key string) (bool, error) {
    cnt, err := Client().Exists(ctx, key).Result()
    return cnt > 0, err
}

func GetTTL(ctx context.Context, key string) (time.Duration, error) {
    return Client().TTL(ctx, key).Result()
}

func ExpireKey(ctx context.Context, key string, ttl time.Duration) (bool, error) {
    return Client().Expire(ctx, key, ttl).Result()
}

func LockKey(ctx context.Context, key string, ttl time.Duration) (bool, error) {
    return Client().SetNX(ctx, key, "locked", ttl).Result()
}

func ReleaseLock(ctx context.Context, key string) error {
    _, err := Client().Del(ctx, key).Result()
    return err
}

// ExecuteLuaScript executes a Lua script on Redis
func ExecuteLuaScript(ctx context.Context, script string, keys []string, args ...interface{}) (interface{}, error) {
	return Client().Eval(ctx, script, keys, args...).Result()
}

// Incr increments a key by 1
func Incr(ctx context.Context, key string) (int64, error) {
	return Client().Incr(ctx, key).Result()
}

// Decr decrements a key by 1
func Decr(ctx context.Context, key string) (int64, error) {
	return Client().Decr(ctx, key).Result()
}
