import asyncio
import json
from aiokafka import ConsumerRecord

from core.domain.request.query_request import QueryRequest
from core.service.onboarding_service import generate_calendar_schedule


async def register_calendar_schedule_handler(msg: ConsumerRecord):
    ## convert message string value to json
    payload = json.loads(msg.value)
    query = QueryRequest.model_validate(payload)
    print(f"Received payload for register_calendar_schedule: {payload}")

    task = asyncio.create_task(generate_calendar_schedule(query))
    task.add_done_callback(_log_background_task_error)

    return None


def _log_background_task_error(task: asyncio.Task) -> None:
    try:
        task.result()
    except Exception as exc:
        print(f"Background task generate_calendar_schedule failed: {exc}")
