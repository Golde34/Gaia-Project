from core.domain.enums.redis_enum import RedisEnum
from infrastructure.redis.redis import delete_key


def clear_user_llm_config(user_id: str):
    user_model_key = f"{RedisEnum.USER_LLM_MODEL.value}:{user_id}"
    delete_key(user_model_key)