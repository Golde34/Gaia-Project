import asyncio
import json
from aiokafka import ConsumerRecord

from core.domain.request.query_request import QueryRequest
from core.usecase.onboarding_usecase import generate_calendar_schedule
from kernel.utils.background import log_background_task_error


async def register_calendar_schedule_handler(msg: ConsumerRecord):
    ## convert message string value to json
    payload = json.loads(msg.value)
    query = QueryRequest.model_validate(payload.get("data"))
    print(f"Received payload for register_calendar_schedule: {payload}")

    task = asyncio.create_task(generate_calendar_schedule(query))
    task.add_done_callback(log_background_task_error)

    return None
