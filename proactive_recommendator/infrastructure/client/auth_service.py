import json
from core.domain.response.base_response import BaseResponse, return_response
from kernel.config.config import Config as config
from kernel.utils import aiohttp_utils
from kernel.utils.build_header import build_authorization_headers
from kernel.utils.return_http_response import client_return


class AuthServiceClient:
    """
    Client for interacting with the Auth Service.
    This service provides access to user's information and other related functionalities.
    """

    def __init__(self):
        self.base_url = config.AUTH_SERVICE_URL

    async def get_user_information(self, user_id: int) -> BaseResponse:
        try:
            headers = build_authorization_headers(service="authentication_service", user_id=user_id)
            endpoint = f"{self.base_url}/user/get-user-by-id?id="+str(user_id)
            result = await aiohttp_utils.get(
                endpoint=endpoint,
                header=headers
            )
            print("Result: ", result)
            return client_return(result=result) 

        except Exception as e:
            print("Tracking error when get user information: ", e)
            return None


auth_service_client = AuthServiceClient()
