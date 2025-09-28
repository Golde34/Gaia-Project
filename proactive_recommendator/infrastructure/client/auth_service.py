from kernel.config.config import Config as config
from kernel.utils import aiohttp_utils
from kernel.utils.build_header import build_authorization_headers


class AuthServiceClient:
    """
    Client for interacting with the Chat Hub Service.
    This service provides access to chat history and other related functionalities.
    """

    def __init__(self):
        self.base_url = config.AUTH_SERVICE_URL

    async def get_user_information(self, user_id: int):
        try:
            headers = build_authorization_headers(service="authentication_service", user_id=user_id)
            endpoint = f"{self.base_url}/user/get-user-by-id"
            result = await aiohttp_utils.get(
                endpoint=endpoint,
                params={"userId": user_id},
                header=headers
            )
            if not result:
                print("??? user does not exist or what? --> logging tracker")
                return None
            return result
        except Exception as e:
            print("Tracking error when get user information: ", e)
            return None


auth_service_client = AuthServiceClient()
