import json
from aiokafka import ConsumerRecord

from core.domain.enums import kafka_enum, enum
from core.domain.request.query_request import QueryRequest
from core.service.abilities.task_service import personal_task_service
from infrastructure.kafka.producer import publish_message
# from infrastructure.repository.agent_execution_repository import task_status_repo


async def update_task_status_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    data = payload.get("data", payload) if isinstance(payload, dict) else payload
    cmd = payload.get("cmd") if isinstance(payload, dict) else None
    if cmd == kafka_enum.KafkaCommand.GENERATE_TASK_RESULT.value:
        return await _create_personal_task_result(data)

    # user_id = data.get("userId") or data.get("user_id")
    # task_id = data.get("taskId") or data.get("task_id")
    # original_query = data.get("query")
    # status = (data.get("status") or "").upper()
    # result = data.get("result")

    # if user_id is None or not task_id or not original_query:
    #     print("Task status handler: missing required identifiers")
    #     return None

    # pass

    # stored_task = task_status_repo.get_task(user_id=user_id, task_id=task_id)
    # if not stored_task:
    #     print(f"Task status handler: no task found for {task_id}")
    #     return None

    # if stored_task.get("query") != original_query:
    #     print(f"Task status handler: query mismatch for task {task_id}")
    #     return None

    # normalized_status = status if status in TaskStatus._value2member_map_ else TaskStatus.FAILED.value
    # updated = task_status_repo.update_status(
    #     user_id=user_id,
    #     task_id=task_id,
    #     status=normalized_status,
    #     result=result,
    # )
    # print(f"Task status handler: updated task {task_id} -> {updated}")
    # return updated

async def _create_personal_task_result(data: dict) -> str:
    print("Creating personal task result with data:", data)
    task = data.get("task")
    query_data = data.get("query")
    query: QueryRequest = QueryRequest(**query_data)
    print("Task data - task:", task, "query:", query)
    # Call the task service to handle task result
    task_result = await personal_task_service.handle_task_result(task=task, query=query)
    await publish_message(
        kafka_enum.KafkaTopic.PUSH_MESSAGE.value,
        kafka_enum.KafkaCommand.GENERATE_TASK_RESULT.value,
        task_result,
    )