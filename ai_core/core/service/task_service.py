import json

from core.domain.request.query_request import QueryRequest
from core.domain.response.model_output_schema import CreateTaskResultSchema, CreateTaskSchema
from core.prompt import CREATE_TASK_PROMPT, TASK_CLASSIFY_PROMPT, CHITCHAT_PROMPT, TASK_RESULT_PROMPT, PARSING_DATE_PROMPT
from kernel.configs import llm_models
from kernel.configs.tree_function import FUNCTIONS
from core.domain.response.base_response import return_success_response
from core.utils.utils import parse_json_string

def _optimize_datetime(datetime_object: dict, model_name: str) -> dict:
    try:
        prompt = PARSING_DATE_PROMPT.format(input=datetime_object)

        response = llm_models.get_model_generate_content(model_name)(
            prompt=prompt, model_name=model_name)
        return parse_json_string(response)
    except Exception as e:
        raise e

def _create_task(query: QueryRequest) -> dict:
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

        # Gọi mô hình và parse response
        response = llm_models.get_model_generate_content(query.model_name)(
            prompt=prompt, model_name=query.model_name, dto=CreateTaskSchema
        )
        task_data = json.loads(response)

        # Xử lí cho parsing datetime
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



def _chitchat(query: QueryRequest) -> str:
    """
    Chitchat pipeline
    Args:
        query (str): The user's query containing task information.
    Returns:
        str: Short response to the request
    """

    try:
        prompt = CHITCHAT_PROMPT.format(query=query.query)

        response = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)
        print("Response:", response)
        return response
    except Exception as e:
        raise e


def _task_result(query: QueryRequest) -> str:
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
        print("Response:", response)
        return json.loads(response) 
    except Exception as e:
        raise e


def task_service(query: QueryRequest):
    """
    Classify type of task using for the query
    Args:
        query (str): The user's query containing task information.
    Returns:
        Task service function
    """
    try:
        print("Start task service")
        tools_string = json.dumps(FUNCTIONS, indent=2)

        prompt = TASK_CLASSIFY_PROMPT.format(
            query=query.query, tools=tools_string)
        
        response = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)
        

        if 'create_task' in response:
            print("Start create task service")
            create_task_response = _create_task(query=query)
            print("Create task response:", create_task_response)
            data = {
                'type': 'create_task',
                'response': create_task_response.get('response'),
                'task': create_task_response
            }
            print("Data:", data)
            return return_success_response(
                status_message="Create task response successfully",
                data=data
            )
        elif 'task_result' in response:
            print("Start task result service")
            task_result_response = _task_result(query=query)
            data = {
                'type': 'task_result',
                'response': task_result_response.get('response'),
                'task': task_result_response 
            }
            return return_success_response(
                status_message="Task result response successfully",
                data=data
            )
        else:
            print("Start chitchat service")
            data = {
                'type': 'chitchat',
                'response': _chitchat(query=query)
            }
            return return_success_response(
                status_message="Chitchat response successfully",
                data=data
            )
    except Exception as e:
        raise e
