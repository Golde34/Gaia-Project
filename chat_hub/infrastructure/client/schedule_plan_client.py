from core.domain.response.model_output_schema import DailyRoutineSchema
from kernel.config import config
from kernel.utils import aiohttp_utils, build_header


class SchedulePlanClient:
    """
    Client for interacting with the Schedule Plan Service.
    This service provides functionalities related to schedule, calendar, etc. functions.
    """
    def __init__(self):
        self.base_url = config.SCHEDULE_PLAN_SERVICE_URL

    async def create_or_update_time_bubble_configs(self, user_id: int, schedule_config: DailyRoutineSchema) -> dict:
        try:
            endpoint = f"{self.base_url}/schedule-plan/schedule-day/generate-time-bubble"
            headers = build_header.build_default_headers()
            payload = {
                "userId": user_id,
                "schedule": schedule_config
            }
            result = await aiohttp_utils.post(
                endpoint=endpoint,
                payload=payload,
                header=headers
            )
            if not result:
                print("No response from Schedule Plan Service.")
                return {}

            print("Received response from Schedule Plan Service:", result["status"])
            return result["data"]
        except Exception as e:
            print(f"Error in SchedulePlanClient.create_or_update_time_bubble_configs: {e}")
            return {} 
    
schedule_plan_client = SchedulePlanClient()