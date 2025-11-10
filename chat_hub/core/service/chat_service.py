import datetime
import uuid

from core.domain.entities.recursive_summary import RecursiveSummary
from core.domain.enums.redis_enum import RedisEnum
from core.domain.request.chat_hub_request import RecentHistoryRequest
from core.domain.request.query_request import QueryRequest
from core.domain.response.model_output_schema import LongTermMemorySchema
from core.prompts.system_prompt import CHAT_HISTORY_PROMPT, LONGTERM_MEMORY_PROMPT, RECURSIVE_SUMMARY_PROMPT
from core.validation import milvus_validation
from core.service.integration.message_service import message_service
from infrastructure.repository.recursive_summary_repository import recursive_summary_repo
from infrastructure.redis.redis import set_key, get_key
from infrastructure.vector_db.milvus import milvus_db
from infrastructure.embedding.base_embedding import embedding_model
from kernel.config import llm_models, config


async def query_chat_history(query: QueryRequest, semantic_response: dict = config.DEFAULT_SEMANTIC_RESPONSE):
    """
    Routes the request based on semantic guidance, querying different memory sources.
    """
    recent_history = recursive_summary = long_term_memory = ''
    if semantic_response.get('recent_history'):
        recent_history = await message_service.get_recent_history(
            RecentHistoryRequest(user_id=query.user_id,
                                 dialogue_id=str(query.dialogue_id),
                                 number_of_messages=config.RECENT_HISTORY_MAX_LENGTH)
        )
        print(f"Recent History: {recent_history}")

    if semantic_response.get('recursive_summary'):
        recursive_summary = await get_recursive_summary(query.user_id, query.dialogue_id)

    if semantic_response.get('long_term_memory'):
        long_term_memory = await get_long_term_memory(query.user_id, query.dialogue_id, query.query)

    return recent_history, recursive_summary, long_term_memory


async def get_recursive_summary(user_id: int, dialogue_id: str) -> str:
    """
    Retrieves recursive summary from Redis, falling back to the database if necessary.
    """
    try:
        recursive_summary_key = f"{RedisEnum.RECURSIVE_SUMMARY_CONTENT.value}:{user_id}:{dialogue_id}"
        recursive_summary_content = get_key(recursive_summary_key)
        if not recursive_summary_content:
            recursive_summary_content = await recursive_summary_repo.list_by_dialogue(user_id=user_id, dialogue_id=dialogue_id)

        return recursive_summary_content or ''
    except Exception as e:
        print(f"Error in _get_recursive_summary: {e}")
        return ''


async def get_long_term_memory(user_id: int, dialogue_id: str, query: str) -> str:
    """
    Retrieve long term memory from Redis or Milvus.

    Args:
        user_id (str): The user's ID.
        dialogue_id (str): The dialogue ID.
        query (str): The user's query.

    Returns:
        str: The long term memory content.
    """
    try:
        embeddings = await embedding_model.get_embeddings(texts=[query])
        long_term_memory = milvus_db.search_top_n(
            query_embeddings=milvus_validation.validate_milvus_search_top_n(
                embeddings),
            top_k=5,
            partition_name="default_memory"
        )

        if long_term_memory is None or len(long_term_memory) == 0:
            print(
                f"No long term memory found for user {user_id} and dialogue {dialogue_id}")
            return ''

        filtered_memory = [
            memory for memory in long_term_memory if memory['metadata'].get('user_id') == user_id and memory['metadata'].get('dialogue_id') == dialogue_id
        ]
        return ', '.join([memory['content'] for memory in filtered_memory]) if filtered_memory else ''

    except Exception as e:
        print(f"Error retrieving long term memory: {e}")
        return ''


async def reflection_chat_history(recent_history: str, recursive_summary: str, long_term_memory: str, query: QueryRequest):
    """
    Generate a new prompt based on the recent history, recursive summary, long term memory, and the current query.
    This function can be customized to reflect the conversation context.
    """
    new_prompt = CHAT_HISTORY_PROMPT.format(
        recent_history=recent_history,
        recursive_summary=recursive_summary,
        long_term_memory=long_term_memory,
        current_query=query.query,
    )
    model_name = config.LLM_DEFAULT_MODEL
    function = await llm_models.get_model_generate_content(model_name, query.user_id)
    new_query = function(prompt=new_prompt, model_name=model_name)
    print(f"New query generated: {new_query}")
    return new_query


async def update_recursive_summary(user_id: int, dialogue_id: str) -> None:
    """
    Update the recursive summary in Redis.

    Args:
        query (QueryRequest): The user's query containing user_id and dialogue_id.
        response (str): The response to be added to the recursive summary.
    """
    try:
        recent_history = await message_service.get_recent_history(
            request=RecentHistoryRequest(
                user_id=user_id,
                dialogue_id=dialogue_id,
                number_of_messages=config.RECURSIVE_SUMMARY_MAX_LENGTH,
            )
        )
        if not recent_history:
            recent_history = "No recent history available."

        prompt = RECURSIVE_SUMMARY_PROMPT.format(
            recent_history=recent_history)
        model_name = config.LLM_DEFAULT_MODEL
        function = await llm_models.get_model_generate_content(model_name, user_id)
        recursive_summary_str = function(prompt=prompt, model_name=model_name)
        print(f"Recursive Summary: {recursive_summary_str}")

        recursive_summary = RecursiveSummary(
            id=uuid.uuid4().hex,
            user_id=user_id,
            dialogue_id=dialogue_id,
            summary=recursive_summary_str,
            created_at=datetime.date.today(),
        )
        print(f"Saving recursive summary for user {user_id} and dialogue {dialogue_id}")
        await recursive_summary_repo.save_summary(summary=recursive_summary)

        recursive_summary_key = RedisEnum.RECURSIVE_SUMMARY_CONTENT.value + \
            f":{user_id}:{dialogue_id}"
        set_key(recursive_summary_key, recursive_summary.summary)
        print(
            f"Recursive summary updated for user {user_id} and dialogue {dialogue_id}")

    except Exception as e:
        print(f"Error updating recursive summary: {e}")


async def update_long_term_memory(user_id: int, dialogue_id: str) -> None:
    """
    Update the long term memory in Redis.

    Args:
        query (QueryRequest): The user's query containing user_id and dialogue_id.
        response (str): The response to be added to the long term memory.
    """
    try:
        recent_history = message_service.get_recent_history(
            query=RecentHistoryRequest(
                user_id=user_id,
                dialogue_id=str(dialogue_id),
                number_of_messages=config.LONG_TERM_MEMORY_MAX_LENGTH
            )
        )
        if not recent_history:
            recent_history = "No recent history available."

        prompt = LONGTERM_MEMORY_PROMPT.format(
            recent_history=recent_history)
        model_name = config.LLM_DEFAULT_MODEL
        function = await llm_models.get_model_generate_content(model_name, user_id)
        long_term_memory = function(
            prompt=prompt, model_name=model_name, dto=LongTermMemorySchema)
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
