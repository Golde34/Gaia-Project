from core.domain.request.query_request import QueryRequest
from core.domain.response.base_response import return_success_response 
from core.service.task_service import _create_task, _task_result, _chitchat


def handle_service(query: QueryRequest, response: any) -> str:
    """
    Handle the service request based on the query type.
    Args:
        query (str): The user's query containing task information.
    Returns:
        str: The response from the service handler.
    """
    try:
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