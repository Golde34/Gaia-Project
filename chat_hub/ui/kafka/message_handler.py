import json
from aiokafka import ConsumerRecord

from core.domain.enums import enum
from core.domain.request.query_request import LLMModel, QueryRequest
from core.usecase.onboarding_usecase import generate_calendar_schedule
from kernel.config import config
from kernel.utils.background_loop import background_loop_pool, log_background_task_error 


async def register_calendar_schedule_handler(msg: ConsumerRecord):
    ## convert message string value to json
    payload = json.loads(msg.value)
    query = QueryRequest.model_validate(payload.get("data"))
    if query.model is None:
        llm_model: LLMModel = LLMModel(
            model_name=config.LLM_DEFAULT_MODEL,
            model_key=config.SYSTEM_API_KEY,
            memory_model=enum.MemoryModel.DEFAULT.value,
            organization=config.SYSTEM_ORGANIZATION
        )
        query.model = llm_model
    print(f"Received payload for register_calendar_schedule: {payload}")
 
    background_loop_pool.schedule(
        lambda: generate_calendar_schedule(query),
        callback=log_background_task_error,
    )
    return None
