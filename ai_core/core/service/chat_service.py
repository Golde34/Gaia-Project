import datetime
import uuid

from core.domain.entities.recursive_summary import RecursiveSummary
from core.domain.enums.redis_enum import RedisEnum
from core.domain.request.query_request import QueryRequest
from core.domain.response.model_output_schema import LongTermMemorySchema
from core.validation import milvus_validation
from core.prompts.system_prompt import LONGTERM_MEMORY_PROMPT, RECURSIVE_SUMMARY_PROMPT, CHAT_HISTORY_PROMPT 
from kernel.config import llm_models, config
from infrastructure.repository.recursive_summary_repository import recursive_summary_repo
from infrastructure.redis.redis import set_key
from infrastructure.vector_db.milvus import milvus_db
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.client.chat_hub_service_client import chat_hub_service_client


def reflection_chat_history(recent_history: str, recursive_summary: str, long_term_memory: str, query: str):
        """
        Generate a new prompt based on the recent history, recursive summary, long term memory, and the current query.
        This function can be customized to reflect the conversation context.
        """
        new_prompt = CHAT_HISTORY_PROMPT.format(
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory,
            current_query=query,
        )
        print(f"New prompt generated: {new_prompt}")
        return new_prompt

async def update_recursive_summary(user_id: str, dialogue_id: str) -> None:
    """
    Update the recursive summary in Redis.
    
    Args:
        query (QueryRequest): The user's query containing user_id and dialogue_id.
        response (str): The response to be added to the recursive summary.
    """
    try:
        recent_history = chat_hub_service_client.get_recent_history(
            query=QueryRequest(
                user_id=user_id,
                dialogue_id=dialogue_id,
                number_of_messages=3
            )
        )
        if not recent_history:
            recent_history = "No recent history available."
        
        prompt = RECURSIVE_SUMMARY_PROMPT.format(
            recent_history=recent_history)
        model_name = config.LLM_DEFAULT_MODEL 
        recursive_summary = llm_models.get_model_generate_content(
            model_name)(prompt=prompt, model_name=model_name)
        print(f"Recursive Summary: {recursive_summary}")
        
        recursive_summary = RecursiveSummary(
            user_id=user_id,
            dialogue_id=dialogue_id,
            summary=recursive_summary,
            created_at=datetime.date.today(),
        ) 
        recursive_summary_repo.save_summary(
            summary=recursive_summary 
        )

        recursive_summary_key = RedisEnum.RECURSIVE_SUMMARY_CONTENT.value + f":{user_id}:{dialogue_id}"
        set_key(recursive_summary_key, recursive_summary)
        print(f"Recursive summary updated for user {user_id} and dialogue {dialogue_id}")
        
    except Exception as e:
        print(f"Error updating recursive summary: {e}")

async def update_long_term_memory(user_id: str, dialogue_id: str) -> None:
    """
    Update the long term memory in Redis.
    
    Args:
        query (QueryRequest): The user's query containing user_id and dialogue_id.
        response (str): The response to be added to the long term memory.
    """
    try:
        recent_history = chat_hub_service_client.get_recent_history(
            query=QueryRequest(
                user_id=user_id,
                dialogue_id=dialogue_id,
                number_of_messages=10
            )
        )
        if not recent_history:
            recent_history = "No recent history available."

        prompt = LONGTERM_MEMORY_PROMPT.format(
            recent_history=recent_history)
        model_name = config.LLM_DEFAULT_MODEL
        long_term_memory = llm_models.get_model_generate_content(
            model_name)(prompt=prompt, model_name=model_name, dto=LongTermMemorySchema)
        print(f"Long Term Memory: {long_term_memory}")

        metadata = []
        for memory in long_term_memory:
            metadata.append({
                "user_id": user_id,
                "dialogue_id": dialogue_id,
                "memory": memory,
                "core_memory_id": uuid.UUID().hex,
                "created_at": datetime.date.today().isoformat()
            })
        
        embedding = await embedding_model.get_embeddings(texts=long_term_memory)
        query_embeddings = milvus_validation.validate_milvus_insert(embedding)
        for memory in long_term_memory:
            milvus_db.insert_data(
                vectors=query_embeddings,
                contents=long_term_memory,
                metadata_list=metadata,
                partition_name="default_memory"     
            )
    except Exception as e:
        print(f"Error updating long term memory: {e}") 