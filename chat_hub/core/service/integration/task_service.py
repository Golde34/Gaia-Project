import json

from chat_hub.infrastructure.client.task_manager_client import task_manager_client
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.domain.response.model_output_schema import CreateTaskResultSchema, CreateTaskSchema
from core.prompts.task_prompt import CREATE_TASK_PROMPT, PARSING_DATE_PROMPT, TASK_RESULT_PROMPT
from kernel.config import llm_models
from kernel.utils.parse_json import parse_json_string


async def create_personal_task(query: QueryRequest) -> dict:
    """
    Create task pipeline
    Args:
        query (str): The user's query containing task information.
    Returns:
        str: Short response to the request
    """
    try:
        task_data = await _create_personal_task_llm(query)
        task_result = task_manager_client.create_personal_task(task_data)
        # Store task result if create task succeeds
        return task_data
    except Exception as e:
        raise e


async def _create_personal_task_llm(query: QueryRequest) -> dict:
    """
    Create task information extraction prompt for Gemini API.
    Args:
        query (QueryRequest): The user's query containing task information.
    Returns:
        dict: A structured JSON object with the extracted and optionally optimized task information.
    """
    try:
        datetime_parse_col = ['startDate', 'deadline']
        prompt = CREATE_TASK_PROMPT.format(query=query.query)

        function = await llm_models.get_model_generate_content(query.model, query.user_id)
        response = function(
            prompt=prompt, model=query.model, dto=CreateTaskSchema)

        task_data = json.loads(response)

        datetime_values = {
            key: value for key, value in task_data.items()
            if key in datetime_parse_col and value
        }

        if datetime_values:
            optimized = await _optimize_datetime(
                datetime_object=datetime_values, query=query
            )

            for key in list(optimized.keys()):
                if key not in datetime_values:
                    del optimized[key]

            for key, expr in optimized.items():
                try:
                    task_data[key] = eval(expr)
                except Exception:
                    print("Exception while parsing", expr)
                    task_data[key] = datetime_values[key]

        return task_data

    except Exception as e:
        raise e


async def _optimize_datetime(datetime_object: dict, query: QueryRequest) -> dict:
    try:
        prompt = PARSING_DATE_PROMPT.format(input=datetime_object)
        function = await llm_models.get_model_generate_content(query.model, query.user_id)
        response = function(prompt=prompt, model=query.model)
        return parse_json_string(response)
    except Exception as e:
        raise e


async def create_personal_task_result(query: QueryRequest) -> str:
    """
    Task result pipeline
    Args:
        query (str): The user's query containing task information.
    Returns:
        str: Short response to the request
    """

    try:
        prompt = TASK_RESULT_PROMPT.format(query=query.query)

        function = await llm_models.get_model_generate_content(query.model, query.user_id)
        response = function(prompt=prompt, model=query.model,
                            dto=CreateTaskResultSchema)
        return json.loads(response)
    except Exception as e:
        raise e


def handle_task_service_response(matched_type: str, result: any) -> str:
    if matched_type == enum.GaiaAbilities.CHITCHAT.value:
        data = {
            'type': matched_type,
            'response': result
        }
    elif matched_type == enum.GaiaAbilities.SEARCH.value:
        payload = result if isinstance(result, dict) else {
            'response': str(result)}
        data = {
            'type': matched_type,
            'response': payload.get('response', ''),
            'search': payload
        }
    else:
        data = {
            'type': matched_type,
            'response': result.get('response'),
            'task': result
        }

    return data
