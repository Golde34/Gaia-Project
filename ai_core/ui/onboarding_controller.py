from core.service.base import service_handler
from core.domain.request.query_request import SystemRequest

def handle_onboarding(query: SystemRequest) -> str:
    """
    Handle onboarding queries by returning a predefined response.
    
    Args:
        query (str): The user's query.
        
    Returns:
        str: A predefined response for onboarding queries.
    """
    try:
        return service_handler.handle_service(query=query, classify=query.type)
    except Exception as e:
        raise e