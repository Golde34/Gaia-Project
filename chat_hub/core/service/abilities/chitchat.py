from core.domain.request.query_request import LLMModel, QueryRequest
from core.prompts.abilities_prompt import CHITCHAT_PROMPT, CHITCHAT_WITH_HISTORY_PROMPT
from core.service import memory_service
from kernel.config import config, llm_models


async def chitchat_with_history(query: QueryRequest) -> str:
    """
    Chitchat with history pipeline
    Args:
        query (str): The user's query containing task information.
        recent_history (str): Recent chat history.
        recursive_summary (str): Recursive summary of the conversation.
        long_term_memory (str): Long term memory of the user.
    Returns:
        str: Short response to the request
    """
    try:
        recent_history, recursive_summary, long_term_memory = await memory_service.query_chat_history(query)
        prompt = CHITCHAT_WITH_HISTORY_PROMPT.format(
            query=query.query,
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory
        )
        function = await llm_models.get_model_generate_content(model=query.model, user_id=query.user_id)
        response = function(prompt=prompt, model=query.model)
        return response
    except Exception as e:
        raise e


async def chitchat(query: QueryRequest) -> str:
    """
    Chitchat pipeline
    Args:
        query (str): The user's query containing task information.
    Returns:
        str: Short response to the request
    """
    try:
        prompt = CHITCHAT_PROMPT.format(query=query.query)
        if not query.model:
            model: LLMModel = LLMModel(
                model_name=config.LLM_DEFAULT_MODEL,
                model_key=config.SYSTEM_API_KEY
            )
        else:
            model = query.model
        function = await llm_models.get_model_generate_content(model=model, user_id=query.user_id)
        response = function(prompt=prompt, model=model)
        print("Response:", response)
        return response
    except Exception as e:
        raise e
