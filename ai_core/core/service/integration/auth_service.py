from infrastructure.client.auth_service_client import auth_service_client
from kernel.config.config import LLM_DEFAULT_MODEL


async def refresh_token(refresh_token: str):
    return await auth_service_client.refresh_token(refresh_token)

async def check_token(access_token: str):
    return await auth_service_client.check_token(access_token)

async def get_user_model(user_id: int):
    default_model = LLM_DEFAULT_MODEL
    user_model = await auth_service_client.get_user_llm_model_config(user_id)
    if not user_model:
        return default_model
    return user_model.get("modelName", default_model)
