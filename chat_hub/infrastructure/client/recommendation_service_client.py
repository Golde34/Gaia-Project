from typing import Optional

from kernel.config import config
from kernel.utils import aiohttp_utils


class RecommendationServiceClient:
    """HTTP client for interacting with the proactive recommendation service."""

    def __init__(self) -> None:
        self.base_url = config.RECOMMENDATION_SERVICE_URL

    async def recommend(
        self,
        *,
        query: str,
        user_id: str,
        dialogue_id: Optional[str] = None,
        fingerprint: Optional[str] = None,
    ) -> str:
        payload = {
            "query": query,
            "user_id": self._parse_user_id(user_id),
        }
        if dialogue_id:
            payload["dialogue_id"] = dialogue_id 
        if fingerprint:
            payload["fingerprint"] = fingerprint

        endpoint = f"{self.base_url}/recommend"
        try:
            response = await aiohttp_utils.post(endpoint=endpoint, payload=payload)
            data = response.get("data", {})
            if data.get("skip"):
                return ""
            return data.get("message", "")
        except Exception as exc:
            print(f"Failed to fetch recommendation: {exc}")
            return ""

    def _parse_user_id(self, user_id: Optional[str]) -> int:
        try:
            return int(user_id) if user_id is not None else 0
        except (TypeError, ValueError):
            return 0


recommendation_service_client = RecommendationServiceClient()
