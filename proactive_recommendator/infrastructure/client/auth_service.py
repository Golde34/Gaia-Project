import json
from core.domain.response.base_response import BaseResponse, return_response
from kernel.config.config import Config as config
from kernel.utils import aiohttp_utils
from kernel.utils.build_header import build_authorization_headers


class AuthServiceClient:
    """
    Client for interacting with the Auth Service.
    This service provides access to chat history and other related functionalities.
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
            if not result:
                print("??? user does not exist or what? --> logging tracker")
                return None
            if isinstance(result, str):
                try:
                    response = json.loads(result)
                except json.JSONDecodeError:
                    return return_response(
                        status="error",
                        status_message="Invalid JSON response",
                        error_code=500,
                        error_message="Could not decode response from service",
                        data={}
                    )
            else:
                response = result

            return BaseResponse(
                status=response.get("status", "error"),
                status_message=response.get("statusMessage", ""),
                error_code=response.get("errorCode", 500),
                error_message=response.get("errorMessage", "Unknown error"),
                data=response.get("data", {})
            )

        except Exception as e:
            print("Tracking error when get user information: ", e)
            return None


auth_service_client = AuthServiceClient()
