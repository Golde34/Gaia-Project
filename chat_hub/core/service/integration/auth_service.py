from datetime import datetime, timezone
import json

from core.domain.enums.redis_enum import RedisEnum
from core.domain.response.user_model_response import SystemModelInfo, UserModelResponse
from infrastructure.client.auth_service_client import auth_service_client
from infrastructure.redis.redis import get_key, set_key
from kernel.config.config import LLM_DEFAULT_MODEL, SYSTEM_API_KEY


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


async def get_user_model(user_id: int) -> SystemModelInfo:
    """
    Get user's LLM model configuration. Returns user's custom model if valid,
    otherwise falls back to system default model.
    
    Args:
        user_id: User identifier
        
    Returns:
        SystemModelInfo: Always returns a SystemModelInfo object, never a string
    """
    user_model_key = f"{RedisEnum.USER_LLM_MODEL.value}:{user_id}"
    cached_model = get_key(user_model_key)
    if cached_model:
        return SystemModelInfo.model_validate(json.loads(cached_model))

    user_model = await auth_service_client.get_user_llm_model_config(user_id)
    system_model = _create_system_model(user_model, user_id)
    _cache_user_model(user_model_key, system_model)
    
    return system_model


def _create_system_model(user_model: UserModelResponse | None, user_id: int) -> SystemModelInfo:
    """Create SystemModelInfo from user model or fallback to default."""
    if _is_valid_user_model(user_model, user_id):
        return SystemModelInfo(
            model_name=user_model.model_name,
            model_key=user_model.model_key
        )
    
    return SystemModelInfo(
        model_name=LLM_DEFAULT_MODEL,
        model_key=SYSTEM_API_KEY
    )


def _is_valid_user_model(user_model: UserModelResponse | None, user_id: int) -> bool:
    """Validate user model data integrity."""
    return (
        user_model is not None
        and user_model.user_id == user_id
        and user_model.model_name is not None
        and user_model.model_key is not None
    )


def _cache_user_model(cache_key: str, system_model: SystemModelInfo, ttl: int = 3600) -> None:
    """Cache the system model configuration."""
    set_key(cache_key, json.dumps(system_model.model_dump()), ttl)
