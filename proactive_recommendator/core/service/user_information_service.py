import json

from core.domain.enums.redis_enum import RedisEnum
from core.domain.response.base_response import BaseResponse
from infrastructure.cache.redis import get_key, set_key
from infrastructure.client.auth_service import auth_service_client
from infrastructure.repository.graphdb import user_information_repo


async def get_user_information(user_id: int):
    # Get from Redis
    redis_key = RedisEnum.USER_INFORMATION + str(user_id)
    redis_user_information = get_key(redis_key)
    if redis_user_information is not None:
        return json.loads(redis_user_information)
    # If not, get from GraphDB
    graph_user_information = await user_information_repo.get_user_information(user_id)
    if graph_user_information is not None:
        set_key(key=redis_key, value=json.dumps(
            dict(graph_user_information["u"])), ttl=60*60*24)
        return graph_user_information["u"]
    # If not, call API to Auth service
    return await create_user_information(user_id, redis_key)


async def create_user_information(user_id: int, redis_key: str):
    user_information: BaseResponse = await auth_service_client.get_user_information(user_id=user_id)
    if user_information is None:
        raise Exception("Cannot call to auth service to get user information")
    inserted_user_information = await user_information_repo.create_user_information(user_id, user_information.data['message'])
    result = inserted_user_information["u"]
    print("Insert to graphdb: ", dict(result))
    set_key(key=redis_key, value=json.dumps(
        dict(result)), ttl=60*60*24)
    return result
