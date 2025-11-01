from datetime import datetime, timezone
import json
from re import I

from infrastructure.client.auth_service_client import auth_service_client
from infrastructure.redis.redis import get_key, set_key
from kernel.config.config import LLM_DEFAULT_MODEL


async def refresh_token(refresh_token: str):
    return await auth_service_client.refresh_token(refresh_token)


async def check_token(access_token: str):
    try:
        existed_access_token = get_key(access_token)
        if existed_access_token:
            print("existed_access_token:", existed_access_token)
            return existed_access_token
        
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
    expiry_date = datetime.fromisoformat(expiry_date_str.replace("Z", "+00:00")).astimezone(timezone.utc)
    ttl = (expiry_date - datetime.now(timezone.utc)).total_seconds()
    token_response_str = json.dumps(token_response)
    set_key(access_token, token_response_str, int(ttl))

async def get_user_model(user_id: int):
    default_model = LLM_DEFAULT_MODEL
    user_model = await auth_service_client.get_user_llm_model_config(user_id)
    if not user_model:
        return default_model
    return user_model.get("modelName", default_model)
