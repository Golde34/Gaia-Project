import json
from fastapi import HTTPException
import traceback


from core.domain.request.query_request import QueryRequest
from core.domain.response.model_output_schema import CreateTaskSchema
from core.prompt import CREATE_TASK_PROMPT, TASK_CLASSIFY_PROMPT, CHITCHAT_PROMPT
from kernel.configs import llm_models 
from kernel.configs.tree_function import FUNCTIONS


def _create_task(query: QueryRequest) -> str:
    """
    Create task information extraction prompt for Gemini API.
    Args:
        query (str): The user's query containing task information.
    Returns:
        CreateTaskDto: A structured JSON object with the extracted task information.
        {
        "Project": str,
        "GroupTask": str,
        "Title": str,
        "Priority": str,
        "Status": str,
        "StartDate": Optional[str],
        "Deadline": Optional[str],
        "Duration": Optional[str]
        }
    """
    try:
        prompt = CREATE_TASK_PROMPT.format(query = query.query)
        print("Prompt:", prompt)

        response = llm_models.get_model_generate_content(query.model_name)(prompt=prompt,dto=CreateTaskSchema) 
        print("Response:", response)
        return json.loads(response)
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
        prompt = CHITCHAT_PROMPT.format(query = query.query)
        print("Prompt:", prompt)

        response = llm_models.get_model_generate_content(query.model_name)(prompt=prompt) 
        print("Response:", response)
        return response
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
        
        prompt = TASK_CLASSIFY_PROMPT.format(query = query.query, tools = tools_string)
        print("Prompt:", prompt)

        response = llm_models.get_model_generate_content(query.model_name)(prompt=prompt) 
        print("Response:", response)
        
        if 'create_task' in response:
            print("Start create task service")
            return {
                'type': 'create_task',
                'response': _create_task(query=query)
            }
        else:
            print("Start chitchat service")
            return {
                'type': 'chitchat',
                'response': _chitchat(query=query)
            }
        
    except Exception as e:
        raise e
    