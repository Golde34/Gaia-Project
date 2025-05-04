package redis_cache

import (
    "context"
    "fmt"
    "sync"
    "time"

    "middleware_loader/kernel/configs"
    "github.com/redis/go-redis/v9"
)

var (
    rdb  *redis.Client
    once sync.Once
)

func initClient() {
    redisConfig := configs.RedisConfig{}
    cfg, err := redisConfig.LoadEnv()
    if err != nil {
        panic(fmt.Sprintf("failed to load Redis config: %v", err))
    }
    rdb = redis.NewClient(&redis.Options{
        Addr:     fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
        Password: cfg.Password,
        DB:       0,  // default DB
    })
}

func Client() *redis.Client {
    once.Do(initClient)
    return rdb
}

func SetKey(ctx context.Context, key, value string) error {
    return Client().Set(ctx, key, value, 0).Err()
}

func SetKeyWithTTL(ctx context.Context, key, value string, ttl time.Duration) error {
    return Client().Set(ctx, key, value, ttl).Err()
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
