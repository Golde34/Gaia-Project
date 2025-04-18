from core.gemini_generate_content import create_task
from function_label import FUNCTIONS


def handle_query(query: str, label: str) -> str:
    """
    Handle the user's query and generate a response.
    Args:
        query (str): The user's query.
    Returns:
        str: The generated response.
    """
    for function in FUNCTIONS:
        if label == function.get('label'):
            return function.get('func')(query=query)
    return "No matching function for this query"
    