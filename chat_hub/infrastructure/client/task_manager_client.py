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

            return result["message"]
        except Exception as e:
            print(f"Error in SchedulePlanClient.create_or_update_time_bubble_configs: {e}")
            return None
    
task_manager_client = TaskManagerClient()
