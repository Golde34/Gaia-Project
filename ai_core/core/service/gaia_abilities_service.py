from core.abilities.function_handlers import FUNCTIONS
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.prompts.abilities_prompt import CHITCHAT_PROMPT, CHITCHAT_WITH_HISTORY_PROMPT
from core.service import chat_service
from core.service.task_service import handle_task_service_response
from kernel.config import llm_models, config


async def abilities_handler(query: QueryRequest, guided_route: str) -> str:
    """
    Handle the service request based on the query type dynamically.
    Args:
        query (QueryRequest): The user's query containing task information.
        response (any): The response content to determine service type.
    Returns:
        str: The response from the appropriate service handler.
    """
    print("Abilities Handler called with query:", query)
    try:
        matched_type = next(
            (key for key in FUNCTIONS if key in guided_route), enum.GaiaAbilities.CHITCHAT.value)
        if matched_type == enum.GaiaAbilities.CHITCHAT.value:
            return await chitchat_with_history(query)

        handler = await FUNCTIONS[matched_type]

        result = handler(query=query)

        return handle_task_service_response(query, result)        
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
        if not query.model_name:
            query.model_name = config.LLM_DEFAULT_MODEL
        function = await llm_models.get_model_generate_content(query.model_name, query.user_id)
        response = function(prompt=prompt, model_name=query.model_name)
        print("Response:", response)
        return response
    except Exception as e:
        raise e

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
        recent_history, recursive_summary, long_term_memory = await chat_service.query_chat_history(query, None)
        prompt = CHITCHAT_WITH_HISTORY_PROMPT.format(
            query=query.query,
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory
        )
        function = await llm_models.get_model_generate_content(query.model_name, query.user_id)
        response = function(prompt=prompt, model_name=query.model_name)
        return response
    except Exception as e:
        raise e