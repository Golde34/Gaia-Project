import json

from core.domain.request.query_request import QueryRequest
from core.prompts.task_prompt import CHITCHAT_PROMPT
from kernel.config import llm_models


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
