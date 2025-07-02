import datetime

from core.domain.entities.recursive_summary import RecursiveSummary
from core.domain.enums.redis_enum import RedisEnum
from core.domain.request.query_request import QueryRequest
from infrastructure.client.chat_hub_service_client import chat_hub_service_client
from core.prompts.system_prompt import RECURSIVE_SUMMARY_PROMPT 
from kernel.config import llm_models, config
from infrastructure.repository.recursive_summary_repository import recursive_summary_repo
from infrastructure.redis.redis import set_key


async def update_recursive_summary(query: QueryRequest, response: str) -> None:
    """
    Update the recursive summary in Redis.
    
    Args:
        query (QueryRequest): The user's query containing user_id and dialogue_id.
        response (str): The response to be added to the recursive summary.
    """
    try:
        recent_history = chat_hub_service_client.get_recent_history(
            query=QueryRequest(
                user_id=query.user_id,
                dialogue_id=query.dialogue_id,
                number_of_messages=3
            )
        )
        if not recent_history:
            recent_history = "No recent history available."
        
        prompt = RECURSIVE_SUMMARY_PROMPT.format(
            recent_history=recent_history, response=response)
        if not query.model_name:
            query.model_name = config.LLM_DEFAULT_MODEL 
        recursive_summary = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)
        print(f"Recursive Summary: {recursive_summary}")
        
        recursive_summary = RecursiveSummary(
            user_id=query.user_id,
            dialogue_id=query.dialogue_id,
            summary=recursive_summary,
            created_at=datetime.date.today(),
        ) 
        recursive_summary_repo.save_summary(
            summary=recursive_summary 
        )

        recursive_summary_key = RedisEnum.RECURSIVE_SUMMARY_CONTENT.value + f":{query.user_id}:{query.dialogue_id}"
        set_key(recursive_summary_key, recursive_summary)
        print(f"Recursive summary updated for user {query.user_id} and dialogue {query.dialogue_id}")
        
    except Exception as e:
        print(f"Error updating recursive summary: {e}")