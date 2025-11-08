import asyncio
import json
from aiokafka import ConsumerRecord

from core.domain.enums import kafka_enum
from core.domain.request.query_request import QueryRequest
from core.usecase.onboarding_usecase import generate_calendar_schedule
from kernel.utils.background import log_background_task_error


async def message_handler(msg: ConsumerRecord):
    ## convert message string value to json
    payload = json.loads(msg.value)

    if payload.get("cmd") == kafka_enum.KafkaCommand.GENERATE_CALENDAR_SCHEDULE.value: 
        return await register_calendar_schedule_handler(payload)
    

async def register_calendar_schedule_handler(payload):
    query = QueryRequest.model_validate(payload.get("data"))
    print(f"Received payload for register_calendar_schedule: {payload}")

    task = asyncio.create_task(generate_calendar_schedule(query))
    task.add_done_callback(log_background_task_error)

    return None
