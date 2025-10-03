import json

from core.domain.enums.redis_enum import RedisEnum
from core.domain.response.base_response import BaseResponse
from infrastructure.cache.redis import get_key, set_key
from infrastructure.client.schedule_plan import schedule_plan_client
from infrastructure.repository.graphdb import task_list_repo


async def priority_tasks(user_id: int):
    redis_key = RedisEnum.PRIORITY_TASKS + str(user_id)
    redis_task_list = get_key(redis_key)
    if redis_task_list is not None:
        return json.loads(redis_task_list)

    graph_task_list = await task_list_repo.get_priority_tasks(user_id)
    if graph_task_list is not None:
        set_key(key=redis_key, value=json.dumps(
            dict(graph_task_list["t"])
        ), ttl=60*60)
        return graph_task_list["t"]
    return await _create_priority_tasks(user_id, redis_key)


async def _create_priority_tasks(user_id: int, redis_key: str):
    priority_tasks: BaseResponse = await schedule_plan_client.get_priority_tasks(user_id)
    if priority_tasks is None:
        raise Exception(
            "Cannot call to schedule plan service to get priority tasks")
    if priority_tasks.data is None:
        print("Need logic draft new task list for user")
        return None
    # create priority tasks in graphdb
    set_key(key=redis_key, value=json.dumps(
        dict(priority_tasks.data)), ttl=60*60)
    return priority_tasks.data


async def daily_calendar(user_id: int):
    redis_key = RedisEnum.DAILY_CALENDAR + str(user_id)
    redis_task_list = get_key(redis_key)
    if redis_task_list is not None:
        return json.loads(redis_task_list)

    graph_task_list = await task_list_repo.get_calendar(user_id)
    if graph_task_list is not None:
        set_key(key=redis_key, value=json.dumps(
            dict(graph_task_list["t"])
        ), ttl=60*60)
        return graph_task_list["t"]
    return await _create_daily_calendar(user_id, redis_key)


async def _create_daily_calendar(user_id: int, redis_key: str):
    daily_calendar: BaseResponse = await schedule_plan_client.get_calendar(user_id)
    if daily_calendar is None:
        raise Exception(
            "Cannot call to schedule plan service to get priority tasks")
    if daily_calendar.data is None:
        print("Need logic draft new task list for user")
        return None
    # create daily calendar in graphdb
    set_key(key=redis_key, value=json.dumps(
        dict(daily_calendar.data)), ttl=60*60)
    return daily_calendar.data
