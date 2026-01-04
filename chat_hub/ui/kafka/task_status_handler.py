import json
from aiokafka import ConsumerRecord

from core.domain.enums import kafka_enum


async def ability_result_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    data = payload.get("data", payload) if isinstance(payload, dict) else payload
    cmd = payload.get("cmd") if isinstance(payload, dict) else None
    if cmd == kafka_enum.KafkaCommand.GENERATE_TASK_RESULT.value:
        pass
