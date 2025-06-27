import json

from core.prompts.task_prompt import CHITCHAT_PROMPT, CREATE_TASK_PROMPT, PARSING_DATE_PROMPT, TASK_RESULT_PROMPT
from kernel.config import llm_models
from kernel.utils.parse_json import parse_json_string
from core.domain.request.query_request import QueryRequest, SystemRequest
from core.domain.response.model_output_schema import CreateTaskResultSchema, CreateTaskSchema


def create_task(query: QueryRequest) -> dict:
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

        response = llm_models.get_model_generate_content(query.model_name)(
            prompt=prompt, model_name=query.model_name, dto=CreateTaskSchema
        )
        task_data = json.loads(response)

        datetime_values = {
            key: value for key, value in task_data.items()
            if key in datetime_parse_col and value 
        }
        
        if datetime_values:
            optimized = _optimize_datetime(datetime_object=datetime_values, model_name=query.model_name)

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

def _optimize_datetime(datetime_object: dict, model_name: str) -> dict:
    try:
        prompt = PARSING_DATE_PROMPT.format(input=datetime_object)
        response = llm_models.get_model_generate_content(model_name)(
            prompt=prompt, model_name=model_name)
        return parse_json_string(response)
    except Exception as e:
        raise e

def chitchat(query: QueryRequest) -> str:
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
            query.model_name = "gemini-2.0-flash"
        response = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)
        print("Response:", response)
        return response
    except Exception as e:
        raise e


def task_result(query: QueryRequest) -> str:
    """
    Task result pipeline
    Args:
        query (str): The user's query containing task information.
    Returns:
        str: Short response to the request
    """

    try:
        prompt = TASK_RESULT_PROMPT.format(query=query.query)

        response = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name, dto=CreateTaskResultSchema)
        return json.loads(response) 
    except Exception as e:
        raise e
