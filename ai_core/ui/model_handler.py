from core.gemini_generate_content import create_task


def handle_query(query: str) -> str:
    """
    Handle the user's query and generate a response.
    Args:
        query (str): The user's query.
    Returns:
        str: The generated response.
    """
    return create_task(query=query)
    