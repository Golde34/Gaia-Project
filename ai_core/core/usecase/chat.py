from core.abilities.abilitiy_routers import call_router_function 
from core.domain.enums import redis_enum 
from core.domain.request.query_request import QueryRequest
from core.prompts.classify_prompt import CHAT_HISTORY_PROMPT 
from core.semantic_router.router_registry import chat_history_route
from infrastructure.redis.redis import get_key, set_key, increase_key, decrease_key 


async def chat(query: QueryRequest, chat_type: str):
    recent_history, recursive_summary, long_term_memory = await _chat_history_semantic_router(query=query)
    new_prompt = _reflection(recent_history=recent_history, recursive_summary=recursive_summary, long_term_memory=long_term_memory, query=query.query)
    query.query = new_prompt
    response = await call_router_function(label_value=chat_type, query=query)
    await _update_chat_history(query=query, response=response)
    return response 

async def _chat_history_semantic_router(query: QueryRequest):
    """
    If semantic router guides to recent history, recursive summary or long term memory,
    We must inquiry the chat history samples to determine the next step.
    """
    semantic_response = await chat_history_route(query=query.query) 
    if semantic_response['recent_history'] == True:
        print('Call api to get recent history')
        recent_history = ''
    if semantic_response['recursive_summary'] == True:
        print('Call redis to get recursive summary')
        recursive_summary = ''
    if semantic_response['long_term_memory'] == True:
        print('Call vector database to get long term memory')
        long_term_memory = ''
    return recent_history, recursive_summary, long_term_memory

def _reflection(recent_history: str, recursive_summary: str, long_term_memory: str, query: str):
    """
    Generate a new prompt based on the recent history, recursive summary, long term memory, and the current query.
    This function can be customized to reflect the conversation context.
    """
    new_prompt = CHAT_HISTORY_PROMPT.format(
        recent_history=recent_history,
        recursive_summary=recursive_summary,
        long_term_memory=long_term_memory,
        query=query
    )
    return new_prompt

async def _update_chat_history(query: QueryRequest, response: str):
    """
    Update the chat history with the new query and response.
    """
    rs_queue_length, lt_queue_length = _check_redis(user_id=query.user_id, dialogue_id=query.dialogue_id)
    # await _update_recent_history()
    # await _update_recursive_history()
    # await _update_long_term_memory()
    # await _update_redis()
    _update_redis(rs_queue_length, lt_queue_length, query.user_id, query.dialogue_id)

def _check_redis(user_id: str = None, dialogue_id: str = None):
    recursive_summary_key = redis_enum.RedisEnum.RECURSIVE_SUMMARY.value + f":{user_id}:{dialogue_id}" 
    long_term_memory_key = redis_enum.RedisEnum.LONG_TERM_MEMORY.value + f":{user_id}:{dialogue_id}"

    recursive_summary_queue_length = get_key(recursive_summary_key) or __set_key_ttl(recursive_summary_key) 
    long_term_memory_queue_length = get_key(long_term_memory_key) or __set_key_ttl(long_term_memory_key) 
    return recursive_summary_queue_length, long_term_memory_queue_length

def __set_key_ttl(key: str):
    set_key(key, value=0, ttl=3600)
    return 0

def _update_redis(rs_queue_length: int, lt_queue_length: int, user_id: str, dialogue_id: str):
    """
    Update the redis queue length for recent history and long term memory.
    """
    print(f"Current Redis: rs_queue_length={rs_queue_length}, lt_queue_length={lt_queue_length}")
    recursive_summary_max_length_config = 3
    long_term_memory_max_length_config = 10

    recursive_summary_key = redis_enum.RedisEnum.RECURSIVE_SUMMARY.value + f":{user_id}:{dialogue_id}" 
    long_term_memory_key = redis_enum.RedisEnum.LONG_TERM_MEMORY.value + f":{user_id}:{dialogue_id}"

    current_rs_length = int(rs_queue_length) + 1
    current_lt_length = int(lt_queue_length) + 1

    if current_rs_length < recursive_summary_max_length_config:
        increase_key(recursive_summary_key, amount=1)
    elif current_rs_length == recursive_summary_max_length_config:
        decrease_key(recursive_summary_key, amount=recursive_summary_max_length_config)
    if current_lt_length < long_term_memory_max_length_config:
        increase_key(long_term_memory_key, amount=1)
    elif current_lt_length == long_term_memory_max_length_config:
        decrease_key(long_term_memory_key, amount=long_term_memory_max_length_config)

    print(f"Updated Redis: {recursive_summary_key}={get_key(recursive_summary_key)}, {long_term_memory_key}={get_key(long_term_memory_key)}")
