from core.domain.response.base_response import BaseResponse
from kernel.config.config import Config as config
from kernel.utils import aiohttp_utils
from kernel.utils.return_http_response import client_return 


class SchedulePlanClient:
    """
    Client for interacting with the Schedule Plan.
    This service provides access to user daily schedule and other related functionalities.
    """

    def __init__(self):
        self.base_url = config.SCHEDULE_PLAN_URL

    async def get_calendar(self, user_id: int) -> BaseResponse:
        try:
            endpoint = f"{self.base_url}/schedule-plan/schedule-day/daily-schedule-tasks/"+str(user_id) 
            result = await aiohttp_utils.get(endpoint=endpoint)
            return client_return(result=result)
        except Exception as e:
            print(e)
            return None
    
    async def get_priority_tasks(self, user_id: int) -> BaseResponse:
        try:
            endpoint = f"{self.base_url}/schedule-plan/dashboard/get-active-task-batch/"+str(user_id)
            result = await aiohttp_utils.get(endpoint=endpoint)
            return client_return(result=result)
        except Exception as e:
            print(e)
            return None

schedule_plan_client = SchedulePlanClient()