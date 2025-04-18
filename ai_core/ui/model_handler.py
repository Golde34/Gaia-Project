from kernel.configs.tree_function import FUNCTIONS
from core.domain.request.query_request import QueryRequest


def handle_query(query: QueryRequest, label: str) -> str:
    """
    Handle the user's query and generate a response.
    Args:
        query (str): The user's query.
        label (str): The label of the function to be executed
    Returns:
        str: The generated response.
    """
    for function in FUNCTIONS:
        if label == function.get('label'):
            response = function.get('func')(query=query)
            print(f"Function executed: {function.get('label')}")
            print(f"Response: {response}")
            return function.get('func')(query=query)
            
    return "No matching function for this query"

    