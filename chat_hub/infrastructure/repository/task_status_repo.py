import json
from typing import Any, Dict, Optional

from core.domain.enums.redis_enum import RedisEnum
from infrastructure.redis.redis import get_key, set_key


class TaskStatusRepository:
    def __init__(self) -> None:
        self.prefix = RedisEnum.ABILITY_TASK_STATUS.value

    def _compose_key(self, user_id: Optional[int], task_id: str) -> str:
        user_part = str(user_id) if user_id is not None else "anonymous"
        return f"{self.prefix}:{user_part}:{task_id}"

    def save_task(self, user_id: Optional[int], task_id: str, payload: Dict[str, Any], ttl: int = None) -> None:
        key = self._compose_key(user_id, task_id)
        set_key(key, json.dumps(payload, ensure_ascii=False), ttl=ttl)

    def get_task(self, user_id: Optional[int], task_id: str) -> Optional[Dict[str, Any]]:
        key = self._compose_key(user_id, task_id)
        raw_value = get_key(key)
        if not raw_value:
            return None
        try:
            return json.loads(raw_value)
        except json.JSONDecodeError:
            return None

    def update_status(
        self,
        user_id: Optional[int],
        task_id: str,
        status: str,
        result: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        task = self.get_task(user_id, task_id)
        if not task:
            return None
        task["status"] = status
        if result is not None:
            task["result"] = result
        self.save_task(user_id, task_id, task)
        return task


task_status_repo = TaskStatusRepository()
