from core.domain.request.query_request import QueryRequest
from core.abilities.abilitiy_routers import call_router_function 


async def chat(query: QueryRequest, chat_type: str):
    # _check_redis()
    # new_prompt = _reflection()
    response = call_router_function(label_value=chat_type, query=query)
    # await _update_recent_history()
    # await _update_recursive_history()
    # await _update_long_term_memory()
    # await _update_redis()
    return response

