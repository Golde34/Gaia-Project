import logging
from typing import Dict

from kernel.config import config
from kernel.utils import aiohttp_utils, build_header


class AuthServiceClient:
    """
    Client for interacting with the Auth Service.
    This service provides authentication functionalities such as token refresh.
    """
    def __init__(self):
        self.base_url = config.AUTH_SERVICE_URL
    
    async def refresh_token(self, refresh_token: str) -> dict:
        try:
            endpoint = f"{self.base_url}/auth/refresh-token"
            headers = build_header.build_default_headers()
            result = await aiohttp_utils.post(
                endpoint=endpoint,
                payload=refresh_token,
                header=headers
            )
            if not result:
                print("No response from Auth Service.")
                return {}
            return result["data"]["message"]
        except Exception as e:
            print(f"Error in AuthServiceClient.refresh_token: {e}")
            return {}

    async def validate_service_jwt(self, jwt: str) -> str:
        try:
            service_name = "ChatHub"
            auth_service_url = f"{self.base_url}/auth/admin/validate-service-jwt"
            headers = build_header.build_authorization_headers("authentication_service", "1")
            body = {
                "service": service_name,
                "jwt": jwt
            }
            result = await aiohttp_utils.post(endpoint=auth_service_url, payload=body, header=headers)
            return result.get("message", "")
        except Exception as e:
            logging.error(f"Error in validate_service_jwt: {e}")
            return ""

    async def get_user_llm_model_config(self, user_id: int) -> Dict:
        try:
            user_llm_model_config_url = f"{self.base_url}/user-model-setting/get-model-by-user?userId={user_id}"
            headers = build_header.build_authorization_headers("authentication_service", user_id)
            result = await aiohttp_utils.get(user_llm_model_config_url, header=headers)
            return result.get("message", {})
        except Exception as e:
            logging.error(f"Error in get_user_llm_model_config: {e}")
            return {}

    async def check_token(self, token: str) -> Dict:
        try:
            auth_service_url = f"{self.base_url}/auth/get-check-token"
            headers = build_header.build_default_headers()
            params = {"token": token}
            result = await aiohttp_utils.get(auth_service_url, params=params, header=headers)
            token_response = result["data"]["message"]
            return token_response
        except Exception as e:
            logging.error(f"Error in check_token: {e}")
            return None

auth_service_client = AuthServiceClient()
