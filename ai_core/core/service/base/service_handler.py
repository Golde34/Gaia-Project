from core.domain.request.query_request import QueryRequest
from core.domain.response.base_response import return_success_response
from core.service.task_service import create_task, task_result, chitchat


HANDLERS = {
    'create_task': create_task,
    'task_result': task_result,
    'chitchat': chitchat
}


def handle_service(query: QueryRequest, response: any) -> str:
    """
    Handle the service request based on the query type dynamically.
    Args:
        query (QueryRequest): The user's query containing task information.
        response (any): The response content to determine service type.
    Returns:
        str: The response from the appropriate service handler.
    """
    try:
        matched_type = next(
            (key for key in HANDLERS if key in response), 'chitchat')
        handler = HANDLERS[matched_type]

        if matched_type == 'chitchat':
            result = handler(query=query)
            data = {
                'type': 'chitchat',
                'response': result
            }
        else:
            result = handler(query=query)
            data = {
                'type': matched_type,
                'response': result.get('response'),
                'task': result
            }

        return return_success_response(
            status_message=f"{matched_type.replace('_', ' ').capitalize()} response successfully",
            data=data
        )
    except Exception as e:
        raise e
