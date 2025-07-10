import json

from core.abilities.abilities import ABILITIES
from core.abilities.function_handlers import FUNCTIONS
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.prompts.abilities_prompt import CHITCHAT_PROMPT
from core.prompts.system_prompt import CLASSIFY_PROMPT
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
        handler = await FUNCTIONS[matched_type]

        result = handler(query=query)

        return handle_task_service_response(query, result)        
    except Exception as e:
        raise e

async def chitchat(query: QueryRequest, guided_route) -> str:
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
