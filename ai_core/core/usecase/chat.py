from core.domain.request.query_request import QueryRequest
from core.abilities.abilitiy_routers import ROUTERS 


async def chat(query: QueryRequest, chat_type: str):
    # _check_redis()
    # new_prompt = _reflection()
    routers = ROUTERS.get('label').get(chat_type) 
    abilities_prompt = await routers['function'](query=query)
    # llm_response = _llm(abilities_prompt)
    # await _update_recent_history()
    # await _update_recursive_history()
    # await _update_long_term_memory()
    # await _update_redis()
    # return llm_response
    pass

