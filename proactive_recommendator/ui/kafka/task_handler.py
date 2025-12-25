import json
from aiokafka import ConsumerRecord

from core.domain.enums import kafka_enum


async def get_personal_task_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    data = payload.get("data", payload) if isinstance(payload, dict) else payload
    cmd = payload.get("cmd") if isinstance(payload, dict) else None
    if cmd == kafka_enum.KafkaCommand.PROJECT_LIST.value:
        return await get_projects(data)

async def get_projects(data: dict):
    # I dont know what to do here yet, how can we predict the projects?
    # Can load all user projects from DB, but how can we store them and return fast enough?
    print("Handling personal task with data:", data)