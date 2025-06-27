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