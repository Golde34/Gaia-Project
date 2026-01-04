from datetime import datetime, timezone
import json

from core.domain.enums.enum import MemoryModel
from core.domain.enums.redis_enum import RedisEnum
from core.domain.request.query_request import LLMModel
from core.domain.response.user_model_response import UserModelResponse
from infrastructure.client.auth_service_client import auth_service_client
from infrastructure.redis.redis import get_key, set_key
from kernel.config.config import LLM_DEFAULT_MODEL, SYSTEM_API_KEY, SYSTEM_ORGANIZATION


async def refresh_token(refresh_token: str):
    return await auth_service_client.refresh_token(refresh_token)


async def check_token(access_token: str):
    try:
        existed_access_token = get_key(access_token)
        if existed_access_token:
            print("existed_access_token:", existed_access_token)
            return json.loads(existed_access_token)

        token_response = await auth_service_client.check_token(access_token)
        if not token_response["valid"]:
            return None

        _build_access_token_redis(access_token, token_response)
        return token_response
    except Exception as e:
        print(f"Error in check_token Redis: {e}")
        return None


def _build_access_token_redis(access_token: str, token_response: dict):
    expiry_date_str = token_response["expiryDate"]
    expiry_date = datetime.fromisoformat(
        expiry_date_str.replace("Z", "+00:00")).astimezone(timezone.utc)
    ttl = (expiry_date - datetime.now(timezone.utc)).total_seconds()
    token_response_str = json.dumps(token_response)
    set_key(access_token, token_response_str, int(ttl))


async def get_user_model(user_id: int) -> LLMModel:
    """
    Get user's LLM model configuration. Returns user's custom model if valid,
    otherwise falls back to system default model.
    
    Args:
        user_id: User identifier
        
    Returns:
        LLMModel: Always returns a LLMModel object, never a string
    """
    try:
        user_model_key = f"{RedisEnum.USER_LLM_MODEL.value}:{user_id}"
        cached_model = get_key(user_model_key)
        if cached_model:
            return LLMModel.model_validate(json.loads(cached_model))

        user_model = await auth_service_client.get_user_llm_model_config(user_id)
        system_model = _create_system_model(user_model, user_id)
        _cache_user_model(user_model_key, system_model)
        return system_model 
    except Exception as e:
        print(f"Error in get_user_model: {e}")
        return None


def _create_system_model(user_model: UserModelResponse, user_id: int) -> LLMModel:
    """Create LLMModel from user model or fallback to default."""
    if _is_valid_user_model(user_model, user_id):
        return LLMModel(
            model_name=user_model.model_name,
            model_key=user_model.model_key,
            memory_model=user_model.memory_model,
            organization=user_model.organization
        )
    
    return LLMModel(
        model_name=LLM_DEFAULT_MODEL,
        model_key=SYSTEM_API_KEY,
        memory_model=MemoryModel.DEFAULT.value,
        organization=SYSTEM_ORGANIZATION
    )


def _is_valid_user_model(user_model: UserModelResponse | None, user_id: int) -> bool:
    """Validate user model data integrity."""
    return (
        user_model is not None
        and user_model.user_id == user_id
        and user_model.model_name is not None
        and user_model.model_key is not None
        and user_model.memory_model is not None
        and user_model.organization is not None
    )


def _cache_user_model(cache_key: str, system_model: LLMModel, ttl: int = 3600) -> None:
    """Cache the system model configuration."""
    set_key(cache_key, json.dumps(system_model.model_dump()), ttl)
