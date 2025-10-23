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
            endpoint = f"{self.base_url}/auth/refresh-token/"
            headers = build_header.build_default_headers()
            result = await aiohttp_utils.post(
                endpoint=endpoint,
                json={"refresh_token": refresh_token},
                header=headers
            )
            if not result:
                print("No response from Auth Service.")
                return {}
            return result["message"]
        except Exception as e:
            print(f"Error in AuthServiceClient.refresh_token: {e}")
            return {}

auth_service_client = AuthServiceClient()