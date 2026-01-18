import json
from aiokafka import ConsumerRecord

from core.domain.enums import kafka_enum
from core.usecase import command_usecase


async def synchronize_memory_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    data = payload.get("data", payload) if isinstance(payload, dict) else payload
    cmd = payload.get("cmd") if isinstance(payload, dict) else None
    if cmd == kafka_enum.KafkaCommand.SYNC_PROJECT_MEMORY.value:
        return await sync_project_memory(data)

async def sync_project_memory(data: dict):
    user_id = int(data.get("userId"))
    return await command_usecase.synchronize_all_projects(user_id=user_id)
