from kernel.config import config
from kernel.utils import aiohttp_utils, build_header


class TaskManagerClient:
    """
    Client for interacting with the Task Manager Service.
    This service provides functionalities related to task management.
    """
    def __init__(self):
        self.base_url = config.TASK_MANAGER_SERVICE_URL

    async def create_personal_task(self, task: dict) -> dict:
        try:
            endpoint = f"{self.base_url}/task/create"
            headers = build_header.build_default_headers()
            result = await aiohttp_utils.post(
                endpoint=endpoint,
                payload=task,
                header=headers
            )
            if not result:
                print("No response from Task Manager Service for create_task.")
                return None

            return result["data"]["message"]
        except Exception as e:
            print(f"Error in TaskManagerClient.create_task: {e}")
            return None

    async def project_list(self, user_id: str) -> dict:
        try:
            endpoint = f"{self.base_url}/project/list?userId={user_id}"
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
            endpoint = f"{self.base_url}/task/group/list?groupId={group_id}"
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
    
task_manager_client = TaskManagerClient()
