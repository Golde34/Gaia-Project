import json

from core.domain.enums.redis_enum import RedisEnum
from infrastructure.cache.redis import get_key, set_key
from infrastructure.client.auth_service import auth_service_client


def get_user_information(user_id: int):
    ## Get from Redis
    redis_key = RedisEnum.USER_INFORMATION + user_id
    redis_user_information = json.loads(get_key(redis_key))
    if redis_user_information is not None or redis_user_information != "":
        return redis_user_information
    ## If not, get from GraphDB
    
    ## If not, call API to Auth service
    user_information = auth_service_client.get_user_information(user_id)
    set_key(key=redis_key, value=user_information, ttl=60*60*24)
    pass

def get_user_task_list(query: str):
    pass