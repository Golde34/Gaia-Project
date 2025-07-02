from ai_core.core.domain.request.query_request import QueryRequest


def chitchat(query: QueryRequest) -> str:
    """
    Chitchat pipeline
    Args:
        query (QueryRequest): The user's query containing task information.
    Returns:
        str: Short response to the request
    """
    try:
        return "" 
    except Exception as e:
        raise e

async def update_recursive_summary(query: QueryRequest, response: str) -> None:
    """
    Update the recursive summary in Redis.
    
    Args:
        query (QueryRequest): The user's query containing user_id and dialogue_id.
        response (str): The response to be added to the recursive summary.
    """
    try:
        ## call recent history service with number of messages is 3
        from infrastructure.client.chat_hub_service_client import chat_hub_service_client
        from core.domain.enums.redis_enum import RedisEnum

        recent_history = chat_hub_service_client.get_recent_history(
            query=QueryRequest(
                user_id=query.user_id,
                dialogue_id=query.dialogue_id,
                number_of_messages=3
            )
        )
        if not recent_history:
            recent_history = "No recent history available."
        
        # Get the recursive summary content by calling LLM to summarize the recent history
        from core.prompts.system_prompt import RECURSIVE_SUMMARY_PROMPT 
        from kernel.config import llm_models
        prompt = RECURSIVE_SUMMARY_PROMPT.format(
            recent_history=recent_history, response=response)
        if not query.model_name:
            query.model_name = "gemini-2.0-flash"
        recursive_summary = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)
        print(f"Recursive Summary: {recursive_summary}")
        
        # Store the recursive summary in Database and Redis
        from infrastructure.repository.recursive_summary_repository import recursive_summary_repo
        recursive_summary_repo.create(
            user_id=query.user_id,
            dialogue_id=query.dialogue_id,
            content=recursive_summary
        )
        from infrastructure.redis.redis import set_key
        recursive_summary_key = RedisEnum.RECURSIVE_SUMMARY_CONTENT.value + f":{query.user_id}:{query.dialogue_id}"
        set_key(recursive_summary_key, recursive_summary)
        print(f"Recursive summary updated for user {query.user_id} and dialogue {query.dialogue_id}")
        
                
    except Exception as e:
        print(f"Error updating recursive summary: {e}")