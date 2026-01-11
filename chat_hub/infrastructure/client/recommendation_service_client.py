from typing import List, Optional

from kernel.config import config
from kernel.utils import aiohttp_utils, build_header


class RecommendationServiceClient:
    """HTTP client for interacting with the proactive recommendation service."""

    def __init__(self) -> None:
        self.base_url = config.RECOMMENDATION_SERVICE_URL

    async def recommend(
        self,
        query: str,
        user_id: str,
        dialogue_id: Optional[str] = None,
        waiting_recommendations: List[str] = [],
    ) -> str:
        payload = {
            "query": query,
            "user_id": self._parse_user_id(user_id),
            "waiting_recommendations": waiting_recommendations or []
        }
        if dialogue_id:
            payload["dialogue_id"] = dialogue_id 

        endpoint = f"{self.base_url}/recommend"
        try:
            response = await aiohttp_utils.post(endpoint=endpoint, payload=payload)
            data = response.get("data", {})
            print("Recommendation service response data:", data.get("message", ""))
            return data
        except Exception as exc:
            print(f"Failed to fetch recommendation: {exc}")
            return ""

    def _parse_user_id(self, user_id: Optional[str]) -> int:
        try:
            return int(user_id) if user_id is not None else 0
        except (TypeError, ValueError):
            return 0

    async def project_list(self, user_id: str) -> dict:
        try:
            endpoint = f"{self.base_url}/recommend-info/project/list?userId={user_id}"
            headers = build_header.build_default_headers()
            result = await aiohttp_utils.get(
                endpoint=endpoint,
                header=headers
            )
            if not result:
                print("No response from Task Manager Service for project_list.")
                return None

            return result["data"]["message"]
        except Exception as e:
            print(f"Error in TaskManagerClient.project_list: {e}")
            return None

    async def group_task_list(self, group_id: str) -> dict:
        try:
            endpoint = f"{self.base_url}/recommend-info/group-task/list?groupId={group_id}"
            headers = build_header.build_default_headers()
            result = await aiohttp_utils.get(
                endpoint=endpoint,
                header=headers
            )
            if not result:
                print("No response from Task Manager Service for group_task_list.")
                return None

            return result["data"]["message"]
        except Exception as e:
            print(f"Error in TaskManagerClient.group_task_list: {e}")
            return None


recommendation_service_client = RecommendationServiceClient()
