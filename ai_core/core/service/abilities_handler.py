import json

from core.abilities.abilities import ABILITIES
from core.abilities.function_handlers import FUNCTIONS
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.prompts.classify_prompt import CLASSIFY_PROMPT
from core.service.gaia_abilities_service import handle_task_service_response
from kernel.config import llm_models


def abilities_handler(query: QueryRequest) -> str:
    """
    Handle the service request based on the query type dynamically.
    Args:
        query (QueryRequest): The user's query containing task information.
        response (any): The response content to determine service type.
    Returns:
        str: The response from the appropriate service handler.
    """
    try:
        tools_string = json.dumps(ABILITIES, indent=2)

        prompt = CLASSIFY_PROMPT.format(
            query=query.query, tools=tools_string)

        classify_response = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)

        print("Classify Response:", classify_response)
        
        matched_type = next(
            (key for key in FUNCTIONS if key in classify_response), enum.GaiaAbilities.CHITCHAT.value)
        handler = FUNCTIONS[matched_type]

        result = handler(query=query)

        return handle_task_service_response(query, result)        
    except Exception as e:
        raise e