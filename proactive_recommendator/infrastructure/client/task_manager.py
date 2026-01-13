from core.domain.response.base_response import BaseResponse
from kernel.config.config import Config as config
from kernel.utils import aiohttp_utils
from kernel.utils.return_http_response import client_return


class TaskManagerClient:
    """
    Client for interacting with the Task Manager.
    This service provides access to user's tasks and other related functionalities.
    """

    def __init__(self):
        self.base_url = config.TASK_MANAGER_URL

    async def get_done_tasks(self, user_id: int) -> BaseResponse:
        try:
            endpoint = f"{self.base_url}/task/done-tasks"
            params = {
                "userId": user_id,
                "timeUnit": "weeks"
            }
            result = await aiohttp_utils.get(
                endpoint=endpoint,
                params=params
            )
            return client_return(result)

        except Exception as e:
            print(e)
            return None

    async def get_not_done_tasks(self, user_id: int) -> BaseResponse:
        try:
            endpoint = f"{self.base_url}/task/not-done-tasks"
            params = {
                "userId": user_id,
                "timeUnit": "weeks"
            }
            result = await aiohttp_utils.get(
                endpoint=endpoint,
                params=params
            )
            return client_return(result)

        except Exception as e:
            print(e)
            return None

    async def get_project_list(self, user_id: int) -> BaseResponse:
        try:
            endpoint = f"{self.base_url}/project/get-all/"+str(user_id)
            result = await aiohttp_utils.get(endpoint=endpoint)
            return client_return(result=result)
        except Exception as e:
            print(e)
            return None

    async def get_project_group_task_list(self, user_id: int) -> BaseResponse:
        try:
            endpoint = f"{self.base_url}/project/group-task/{user_id}"
            result = await aiohttp_utils.get(endpoint=endpoint)
            return client_return(result=result)
        except Exception as e:
            print(e)
            return None


task_manager_client = TaskManagerClient()
