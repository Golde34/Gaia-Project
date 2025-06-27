import json

from core.dictionary.tree_function import FUNCTIONS
from core.prompts.classify_prompt import CLASSIFY_PROMPT
from core.domain.enum import enum 
from core.domain.request.query_request import QueryRequest, SystemRequest
from core.domain.response.base_response import return_success_response
from core.dictionary.service_function import HANDLERS
from kernel.config import llm_models


def handle_task_service(query: QueryRequest | SystemRequest) -> str:
    """
    Handle the service request based on the query type dynamically.
    Args:
        query (QueryRequest): The user's query containing task information.
        response (any): The response content to determine service type.
    Returns:
        str: The response from the appropriate service handler.
    """
    try:
        tools_string = json.dumps(FUNCTIONS, indent=2)

        prompt = CLASSIFY_PROMPT.format(
            query=query.query, tools=tools_string)

        classify_response = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)

        print("Classify Response:", classify_response)
        
        matched_type = next(
            (key for key in HANDLERS if key in classify_response), enum.TaskServiceRoute.CHITCHAT.value)
        handler = HANDLERS[matched_type]

        result = handler(query=query)

        return handle_task_service_response(query, result)        
    except Exception as e:
        raise e

def handle_task_service_response(matched_type: str, result: any) -> str:
    if matched_type == enum.TaskServiceRoute.CHITCHAT.value:
        data = {
            'type': matched_type,
            'response': result
        }
    else:
        data = {
            'type': matched_type,
            'response': result.get('response'),
            'task': result
        }

    return return_success_response(
        status_message=f"{matched_type.replace('_', ' ').capitalize()} response successfully",
        data=data
    )