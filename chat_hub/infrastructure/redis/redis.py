from redis.cluster import RedisCluster
from redis.client import Redis
from kernel.config import config


if config.REDIS_MODE == 'cluster':
    rd = RedisCluster(host=config.REDIS_HOST, port=config.REDIS_PORT,
                      password=config.REDIS_PASSWORD, decode_responses=True)
elif config.REDIS_MODE == 'standalone':
    rd = Redis(host=config.REDIS_HOST, port=config.REDIS_PORT,
               password=config.REDIS_PASSWORD, decode_responses=True)


def set_default_key(key: str, type: str):
    if type == "int":
        set_key(key, value=0, ttl=3600)
        return 0


def set_key(key: str, value: str, ttl: int = None) -> None:
    """
    Set a key-value pair in Redis.
    """
    if ttl:
        rd.setex(key, ttl, value)
    else:
        rd.set(key, value)


def get_key(key: str) -> str:
    """
    Get the value of a key from Redis.
    """
    return rd.get(key)


def delete_key(key: str) -> None:
    """
    Delete a key from Redis.
    """
    rd.delete(key)


def key_exists(key: str) -> bool:
    """
    Check if a key exists in Redis.
    """
    return rd.exists(key) > 0


def lock_key(key: str, timeout: int = 10) -> bool:
    """
    Attempt to acquire a lock on a key.
    Returns True if the lock was acquired, False otherwise.
    """
    return rd.set(key, "locked", ex=timeout, nx=True)


def release(key: str) -> None:
    """
    Release a lock on a key.
    """
    delete_key(key)


def increase_key(key: str, amount: int = 1) -> int:
    """
    Increment the value of a key in Redis.
    If the key does not exist, it will be created with the initial value of 0.
    """
    return rd.incr(key, amount)


def decrease_key(key: str, amount: int = 1) -> int:
    """
    Decrement the value of a key in Redis.
    If the key does not exist, it will be created with the initial value of 0.
    """
    return rd.decr(key, amount)
