import json
from aiokafka import ConsumerRecord

from core.domain.enums import kafka_enum
from core.usecase import command_usecase


async def get_personal_task_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    data = payload.get("data", payload) if isinstance(payload, dict) else payload
    cmd = payload.get("cmd") if isinstance(payload, dict) else None
    if cmd == kafka_enum.KafkaCommand.PROJECT_LIST.value:
        return await get_projects(data)
    elif cmd == kafka_enum.KafkaCommand.GROUP_TASK_LIST.value:
        return await get_group_tasks(data)
    elif cmd == kafka_enum.KafkaCommand.DAILY_CALENDAR.value:
        return await get_daily_calendar(data)
    elif cmd == kafka_enum.KafkaCommand.TASK_LIST.value:
        return await get_task_list(data)
    elif cmd == kafka_enum.KafkaCommand.CREATE_PROJECT.value:
        return await create_project(data) 

async def get_projects(data: dict):
    # I dont know what to do here yet, how can we predict the projects?
    # Can load all user projects from DB, but how can we store them and return fast enough?
    print("Handling personal task with data:", data)

async def get_group_tasks(data: dict):
    print("Handling group tasks with data:", data)

async def get_daily_calendar(data: dict):
    print("Handling daily calendar with data:", data)

async def get_task_list(data: dict):
    print("Handling task list with data:", data)

async def create_project(data: dict):
    return await command_usecase.create_project(data)