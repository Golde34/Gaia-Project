import json
from aiokafka import ConsumerRecord

from core.domain.request.query_request import QueryRequest
from core.service.onboarding_service import generate_calendar_schedule


async def register_calendar_schedule_handler(msg: ConsumerRecord):
    ## convert message string value to json
    payload = json.loads(msg.value)
    query = QueryRequest.model_validate(payload)
    print(f"Received payload for register_calendar_schedule: {payload}")
    
    return await generate_calendar_schedule(query)