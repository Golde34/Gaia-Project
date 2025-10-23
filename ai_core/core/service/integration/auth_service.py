from infrastructure.client.auth_service_client import auth_service_client


async def refresh_token(refresh_token: str):
    return await auth_service_client.refresh_token(refresh_token)