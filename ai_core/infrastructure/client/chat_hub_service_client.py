from core.domain.request.chat_hub_request import RecentHistoryRequest
from kernel.config import config
from kernel.utils import aiohttp_utils


class ChatHubServiceClient:
    """
    Client for interacting with the Chat Hub Service.
    This service provides access to chat history and other related functionalities.
    """

    def __init__(self):
        self.base_url = config.CHAT_HUB_SERVICE_URL

    async def get_recent_history(self, request: RecentHistoryRequest) -> str:
        try:
            endpoint = f"{self.base_url}/chat-history/recent-history/"
            result = await aiohttp_utils.get(
                endpoint=endpoint,
                params={
                    "userId": request.user_id,
                    "dialogueId": request.dialogue_id,
                    "numberOfMessages": request.number_of_messages
                })
            if not result:
                print("No recent history found.")
                return ''
            if not self._validate_recent_history_response(request, result):
                print("Recent history response validation failed.")
                return ''

            return result.get('messages')
        except Exception as e:
            print(f"Error in ChatHubServiceClient.get_recent_history: {e}")
            return ''

    def _validate_recent_history_response(self, request: RecentHistoryRequest, response: dict) -> bool:
        if int(request.user_id) != int(response.get('userId')):
            print(f"User ID mismatch: {request.user_id} != {response.get('userId')}")
            return False
        if request.dialogue_id != response.get('dialogueId'):
            print(f"Dialogue ID mismatch: {request.dialogue_id} != {response.get('dialogueId')}")
            return False
        return True


chat_hub_service_client = ChatHubServiceClient()