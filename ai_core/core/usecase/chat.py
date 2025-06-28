import re
from numpy import long
from core.domain.enums import redis_enum 
from core.domain.request.query_request import QueryRequest
from core.abilities.abilitiy_routers import call_router_function 
from infrastructure.redis.redis import get_key, set_key 


async def chat(query: QueryRequest, chat_type: str):
    # _check_redis() to get message queue length of recent his, recursive summary and long term memory 
    rs_queue_length, lt_queue_length = _check_redis(user_id=query.user_id, dialogue_id=query.dialogue_id)
    print(f"Recursive Summary Queue Length: {rs_queue_length}, Long Term Memory Queue Length: {lt_queue_length}")
    # semantic router to determine to call recent history, recursive summary or long term memory
    # new_prompt = _reflection()
    response = await call_router_function(label_value=chat_type, query=query)
    # await _update_recent_history()
    # await _update_recursive_history()
    # await _update_long_term_memory()
    # await _update_redis()
    return response 

def _check_redis(user_id: str = None, dialogue_id: str = None):
    recursive_summary_key = redis_enum.RedisEnum.RECURSIVE_SUMMARY.value + f":{user_id}:{dialogue_id}" 
    long_term_memory_key = redis_enum.RedisEnum.LONG_TERM_MEMORY.value + f":{user_id}:{dialogue_id}"

    recursive_summary_queue_length = get_key(recursive_summary_key) or __set_key_ttl(recursive_summary_key) 
    long_term_memory_queue_length = get_key(long_term_memory_key) or __set_key_ttl(long_term_memory_key) 
    return recursive_summary_queue_length, long_term_memory_queue_length

def __set_key_ttl(key: str):
    set_key(key, value=0, ttl=3600)
    return 0
