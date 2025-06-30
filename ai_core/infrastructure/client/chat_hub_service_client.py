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
        endpoint = f"{self.base_url}/chat-history/recent-history/"
        result = await aiohttp_utils.get(
            endpoint=endpoint,
            params={
                "userId": request.user_id,
                "dialogueId": request.dialogue_id,
                "numberOfMessages": request.number_of_messages
            })
        print(f"ChatHubServiceClient.get_recent_history: {result}")
        return result

chat_hub_service_client = ChatHubServiceClient()