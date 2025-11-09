from typing import Optional

from kernel.utils import aiohttp_utils, build_header
from kernel.config import config


class SchedulePlanServiceClient:
    """HTTP client for interacting with the schedule plan service."""

    def __init__(self) -> None:
        self.base_url = config.SCHEDULE_PLAN_SERVICE_URL

    async def get_time_bubble_config(self, user_id: str) -> Optional[list[dict]]:
        """Fetch time bubble configuration for a given user."""
        endpoint = f"{self.base_url}/schedule-plan/schedule-day/time-bubble-config/{user_id}"
        headers = build_header.build_default_headers()
        response = await aiohttp_utils.get(
            endpoint=endpoint,
            header=headers
        )

        if not isinstance(response, list):
            return None

        return response

schedule_plan_service_client = SchedulePlanServiceClient()
