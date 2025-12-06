import json
from aiokafka import ConsumerRecord

from core.domain.enums.enum import TaskStatus
from infrastructure.repository.task_status_repo import task_status_repo


async def update_parallel_task_status_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    data = payload.get("data", payload) if isinstance(payload, dict) else payload

    user_id = data.get("userId") or data.get("user_id")
    task_id = data.get("taskId") or data.get("task_id")
    original_query = data.get("query")
    status = (data.get("status") or "").upper()
    result = data.get("result")

    if user_id is None or not task_id or not original_query:
        print("Task status handler: missing required identifiers")
        return None

    stored_task = task_status_repo.get_task(user_id=user_id, task_id=task_id)
    if not stored_task:
        print(f"Task status handler: no task found for {task_id}")
        return None

    if stored_task.get("query") != original_query:
        print(f"Task status handler: query mismatch for task {task_id}")
        return None

    normalized_status = status if status in TaskStatus._value2member_map_ else TaskStatus.FAILED.value
    updated = task_status_repo.update_status(
        user_id=user_id,
        task_id=task_id,
        status=normalized_status,
        result=result,
    )
    print(f"Task status handler: updated task {task_id} -> {updated}")
    return updated
