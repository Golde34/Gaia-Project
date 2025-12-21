import datetime
import json
import uuid

from core.domain.enums import kafka_enum, redis_enum
from core.domain.entities.database.recursive_summary import RecursiveSummary
from core.domain.entities.vectordb.long_term_memory import long_term_memory_entity
from core.domain.request.chat_hub_request import RecentHistoryRequest
from core.domain.request.memory_request import MemoryRequest
from core.domain.request.query_request import LLMModel, QueryRequest
from core.domain.response.model_output_schema import LongTermMemorySchema
from core.prompts.system_prompt import CHAT_HISTORY_PROMPT, LONGTERM_MEMORY_PROMPT, RECURSIVE_SUMMARY_PROMPT
from core.semantic_router import router_registry
from core.validation import milvus_validation
from core.service.integration.message_service import message_service
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.kafka.producer import send_kafka_message
from infrastructure.repository.dialogue_repository import user_dialogue_repository
from infrastructure.repository.recursive_summary_repository import recursive_summary_repo
from infrastructure.redis.redis import decrease_key, increase_key, set_key, get_key
from kernel.config import llm_models, config


# Thinking usecase functions
async def recall_history_info(query: QueryRequest, default=True):
    """
    Retrieves the chat history for the user and dialogue ID from Redis.
    """
    if default == False:
        chat_history_semantic_router = await router_registry.chat_history_route(query=query.query)
        recent_history, recursive_summary, long_term_memory = await query_chat_history(query, chat_history_semantic_router)
    else:
        recent_history, recursive_summary, long_term_memory = await query_chat_history(query)

    new_query = await reflection_chat_history(
        recent_history=recent_history,
        recursive_summary=recursive_summary,
        long_term_memory=long_term_memory,
        query=query,
    )
    query.query = new_query
    return query


async def memorize_info(query: QueryRequest, is_change_title: bool):
    """
    Updates the chat history with the new query and response, including managing Redis queues.
    """
    if is_change_title:
        await _update_recursive_summary(query.user_id, query.dialogue_id, is_change_title)
        await _update_long_term_memory(query.user_id, query.dialogue_id, is_change_title)

    rs_len, lt_len = _check_redis(
        user_id=query.user_id, dialogue_id=query.dialogue_id)
    if rs_len >= config.RECURSIVE_SUMMARY_MAX_LENGTH:
        await _update_recursive_summary(query.user_id, query.dialogue_id, is_change_title)

    if lt_len >= config.LONG_TERM_MEMORY_MAX_LENGTH:
        await _update_long_term_memory(query.user_id, query.dialogue_id, is_change_title)

    _update_redis(rs_len, lt_len, query.user_id, query.dialogue_id)


def _check_redis(user_id: int, dialogue_id: str):
    """
    Checks the Redis queue lengths for recursive summary and long-term memory, sets TTL if needed.
    """
    rs_key = f"{redis_enum.RedisEnum.RECURSIVE_SUMMARY.value}:{user_id}:{dialogue_id}"
    lt_key = f"{redis_enum.RedisEnum.LONG_TERM_MEMORY.value}:{user_id}:{dialogue_id}"

    # Get the current queue lengths from Redis or set TTL if not found
    rs_len = get_key(rs_key) or _set_defaultkey(rs_key)
    lt_len = get_key(lt_key) or _set_defaultkey(lt_key)

    return int(rs_len), int(lt_len)


def _set_defaultkey(key: str):
    set_key(key, value=0, ttl=3600)
    return 0


async def _update_recursive_summary(cls, user_id: int, dialogue_id: str, is_change_title: bool):
    """
    Sends a Kafka message to update the recursive summary.
    """
    payload: MemoryRequest = MemoryRequest(
        user_id=user_id,
        dialogue_id=dialogue_id,
        is_change_title=is_change_title
    )
    # Convert Pydantic model to dict for JSON serialization
    await send_kafka_message(kafka_enum.KafkaTopic.UPDATE_RECURSIVE_SUMMARY.value, payload.model_dump())


async def _update_long_term_memory(cls, user_id: int, dialogue_id: str, is_change_title: bool):
    """
    Sends a Kafka message to update the long-term memory.
    """
    payload: MemoryRequest = MemoryRequest(
        user_id=user_id,
        dialogue_id=dialogue_id,
        is_change_title=is_change_title
    )
    # Convert Pydantic model to dict for JSON serialization
    await send_kafka_message(kafka_enum.KafkaTopic.UPDATE_LONG_TERM_MEMORY.value, payload.model_dump())


def _update_redis(rs_len: int, lt_len: int, user_id: int, dialogue_id: str):
    """
    Updates the Redis queues for recursive summary and long-term memory.
    """
    rs_key = f"{redis_enum.RedisEnum.RECURSIVE_SUMMARY.value}:{user_id}:{dialogue_id}"
    lt_key = f"{redis_enum.RedisEnum.LONG_TERM_MEMORY.value}:{user_id}:{dialogue_id}"

    if rs_len + 1 <= config.RECURSIVE_SUMMARY_MAX_LENGTH:
        increase_key(rs_key, amount=1)
    else:
        decrease_key(rs_key, amount=config.RECURSIVE_SUMMARY_MAX_LENGTH)

    if lt_len + 1 <= config.LONG_TERM_MEMORY_MAX_LENGTH:
        increase_key(lt_key, amount=1)
    else:
        decrease_key(lt_key, amount=config.LONG_TERM_MEMORY_MAX_LENGTH)

    print(
        f"Updated Redis: {rs_key}={get_key(rs_key)}, {lt_key}={get_key(lt_key)}")


# Business logic functions
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
        recursive_summary_key = f"{redis_enum.RedisEnum.RECURSIVE_SUMMARY_CONTENT.value}:{user_id}:{dialogue_id}"
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
        embeddings = milvus_validation.validate_milvus_search_top_n(embeddings)
        long_term_memory = long_term_memory_entity.search_top_n(
            query_embeddings=embeddings,
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
    function = await llm_models.get_model_generate_content(query.model, query.user_id)
    new_query = function(prompt=new_prompt, model=query.model)
    print(f"New query generated: {new_query}")
    return new_query


async def kafka_update_recursive_summary(memory_request: MemoryRequest) -> None:
    """
    Update the recursive summary in Redis.

    Args:
        query (QueryRequest): The user's query containing user_id and dialogue_id.
        response (str): The response to be added to the recursive summary.
    """
    user_id = memory_request.user_id
    dialogue_id = memory_request.dialogue_id
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

        prompt = RECURSIVE_SUMMARY_PROMPT.format(recent_history=recent_history)
        model: LLMModel = LLMModel(
            model_name=config.LLM_DEFAULT_MODEL,
            model_key=config.SYSTEM_API_KEY
        )
        function = await llm_models.get_model_generate_content(model=model, user_id=user_id)
        recursive_summary_str = function(prompt=prompt, model=model)
        print(f"Recursive Summary: {recursive_summary_str}")

        recursive_summary = RecursiveSummary(
            id=uuid.uuid4().hex,
            user_id=user_id,
            dialogue_id=dialogue_id,
            summary=str(recursive_summary_str).strip(),
            created_at=datetime.date.today(),
        )
        print(
            f"Saving recursive summary for user {user_id} and dialogue {dialogue_id}")
        await recursive_summary_repo.save_summary(summary=recursive_summary)

        recursive_summary_key = redis_enum.RedisEnum.RECURSIVE_SUMMARY_CONTENT.value + \
            f":{user_id}:{dialogue_id}"
        set_key(recursive_summary_key, recursive_summary.summary)
        print(
            f"Recursive summary updated for user {user_id} and dialogue {dialogue_id}")

    except Exception as e:
        print(f"Error updating recursive summary: {e}")


async def kafka_update_long_term_memory(memory_request: MemoryRequest) -> None:
    """
    Update the long term memory in Redis.

    Args:
        query (QueryRequest): The user's query containing user_id and dialogue_id.
        response (str): The response to be added to the long term memory.
    """
    user_id = memory_request.user_id
    dialogue_id = memory_request.dialogue_id
    try:
        recent_history = await message_service.get_recent_history(
            request=RecentHistoryRequest(
                user_id=user_id,
                dialogue_id=dialogue_id,
                number_of_messages=config.LONG_TERM_MEMORY_MAX_LENGTH,
            )
        )
        if not recent_history:
            recent_history = "No recent history available."

        prompt = LONGTERM_MEMORY_PROMPT.format(
            recent_history=recent_history,
            is_change_title=memory_request.is_change_title
        )

        long_term_memory = await _build_long_term_memory(
            prompt=prompt, user_id=user_id)

        if memory_request.is_change_title and long_term_memory.new_title:
            updated_dialogue = await user_dialogue_repository.update_dialogue_type(
                dialogue_id=dialogue_id,
                new_type=long_term_memory.new_title
            )
            print(
                f"Dialogue type updated to {updated_dialogue} for dialogue ID {dialogue_id}")

        if long_term_memory.content and len(long_term_memory.content) > 0:
            metadata = []
            for memory_item in long_term_memory.content:
                metadata.append({
                    "user_id": user_id,
                    "dialogue_id": dialogue_id,
                    "memory": memory_item,
                    "core_memory_id": uuid.uuid4().hex,
                    "created_at": datetime.datetime.now().isoformat()
                })

            embedding = await embedding_model.get_embeddings(texts=long_term_memory.content)
            query_embeddings = milvus_validation.validate_milvus_insert(embedding)

            long_term_memory_entity.insert_data(
                vectors=query_embeddings,
                contents=long_term_memory.content,
                metadata_list=metadata,
                partition_name="default_memory"
            )
            print(f"Saved {len(long_term_memory.content)} long term memory items to Milvus DB")

    except Exception as e:
        print(f"Error updating long term memory: {e}")


async def _build_long_term_memory(prompt: str, user_id: int) -> LongTermMemorySchema:
    model: LLMModel = LLMModel(
        model_name=config.LLM_DEFAULT_MODEL,
        model_key=config.SYSTEM_API_KEY
    )
    function = await llm_models.get_model_generate_content(model=model, user_id=user_id)
    long_term_memory_str = function(
        prompt=prompt, model=model, dto=LongTermMemorySchema)
    print(f"Long Term Memory raw response: {long_term_memory_str}")

    try:
        # Clean JSON string if needed
        long_term_memory_json = json.loads(long_term_memory_str)
        long_term_memory = LongTermMemorySchema(**long_term_memory_json)
        print(f"Long Term Memory parsed: {long_term_memory}")
    except json.JSONDecodeError as e:
        print(f"Failed to parse long term memory JSON: {e}")
        print(f"Raw response: {long_term_memory_str}")
        # Create empty schema if parsing fails
        long_term_memory = LongTermMemorySchema(content=[], new_title=None)

    return long_term_memory
