from core.domain.request.query_request import QueryRequest
from core.abilities import abilities

async def chat(query: QueryRequest, chat_type: str):
    # _check_redis()
    # new_prompt = _reflection()
    ability = abilities.ABILITIES.get('label').get(chat_type) 
    llm_response = await ability['function'](query=query, chat_type=chat_type)
    # llm_response = _llm()
    # await _update_recent_history()
    # await _update_recursive_history()
    # await _update_long_term_memory()
    # await _update_redis()
    # return llm_response
    pass
