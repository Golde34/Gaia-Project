from operator import is_
from typing import Any

from core.abilities import ability_routers
from core.domain.enums import redis_enum, kafka_enum
from core.domain.request.query_request import QueryRequest
from core.domain.request.memory_request import MemoryRequest
from core.semantic_router import router_registry
from core.service import memory_service
from infrastructure.kafka.producer import send_kafka_message
from infrastructure.redis.redis import get_key, set_key, increase_key, decrease_key
from kernel.config.config import RECURSIVE_SUMMARY_MAX_LENGTH, LONG_TERM_MEMORY_MAX_LENGTH


class ChatUsecase:

    @classmethod
    async def chat(cls, query: QueryRequest, chat_type: str, default=True, **kwargs: Any):
        """
        Gaia selects the appropriate ability based on the chat type and query.
        It retrieves the chat history, generates a new query based on the context,
        and calls the appropriate router function to handle the request.

        Args:
            query (QueryRequest): The user's query containing user_id, dialogue_id, and model_name
            chat_type (str): The type of chat to handle, e.g., abilities, introduction, etc.
            default (bool): Whether to use the default semantic response or a custom one.
            **kwargs: Additional optional arguments (e.g., user_message_id) for downstream handlers.
        Returns:
            dict: The response from the selected ability handler.

        """
        is_change_title = kwargs.get("is_change_title", False)
        user_message_id = kwargs.get("user_message_id")
        if user_message_id is not None:
            query.user_message_id = str(user_message_id)

        print(f"Chat Type: {chat_type}, Query: {query.query}")
        tool_selection, use_chat_history_prompt = await ability_routers.select_ability(
            label_value=chat_type, 
            query=query)

        if use_chat_history_prompt:
            query = await cls.get_chat_history(query=query, default=default)

        print(f"Tool Selection: {tool_selection}")
        response = await ability_routers.call_router_function(
            label_value=chat_type, 
            query=query, 
            guided_route=tool_selection)

        print(f"Response: {response}")

        await cls.update_chat_history(query=query, is_change_title=is_change_title)

        return response

    @classmethod
    async def get_chat_history(cls, query: QueryRequest, default=True):
        """
        Retrieves the chat history for the user and dialogue ID from Redis.
        """
        if default == False:
            chat_history_semantic_router = await router_registry.chat_history_route(query=query.query)
            recent_history, recursive_summary, long_term_memory = await memory_service.query_chat_history(query, chat_history_semantic_router)
        else:
            recent_history, recursive_summary, long_term_memory = await memory_service.query_chat_history(query)

        new_query = await memory_service.reflection_chat_history(
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory,
            query=query,
        )
        query.query = new_query
        return query

    @classmethod
    async def update_chat_history(cls, query: QueryRequest, is_change_title: bool):
        """
        Updates the chat history with the new query and response, including managing Redis queues.
        """
        if is_change_title:
            await cls._update_recursive_summary(query.user_id, query.dialogue_id, is_change_title)
            await cls._update_long_term_memory(query.user_id, query.dialogue_id, is_change_title)

        rs_len, lt_len = cls._check_redis(
            user_id=query.user_id, dialogue_id=query.dialogue_id)
        if rs_len >= RECURSIVE_SUMMARY_MAX_LENGTH:
            await cls._update_recursive_summary(query.user_id, query.dialogue_id, is_change_title)

        if lt_len >= LONG_TERM_MEMORY_MAX_LENGTH:
            await cls._update_long_term_memory(query.user_id, query.dialogue_id, is_change_title)

        cls._update_redis(rs_len, lt_len, query.user_id, query.dialogue_id)

    @staticmethod
    def _check_redis(user_id: int, dialogue_id: str):
        """
        Checks the Redis queue lengths for recursive summary and long-term memory, sets TTL if needed.
        """
        rs_key = f"{redis_enum.RedisEnum.RECURSIVE_SUMMARY.value}:{user_id}:{dialogue_id}"
        lt_key = f"{redis_enum.RedisEnum.LONG_TERM_MEMORY.value}:{user_id}:{dialogue_id}"

        # Get the current queue lengths from Redis or set TTL if not found
        rs_len = get_key(rs_key) or ChatUsecase._set_defaultkey(rs_key)
        lt_len = get_key(lt_key) or ChatUsecase._set_defaultkey(lt_key)

        return int(rs_len), int(lt_len)

    @staticmethod
    def _set_defaultkey(key: str):
        set_key(key, value=0, ttl=3600)
        return 0

    @classmethod
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

    @classmethod
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

    @staticmethod
    def _update_redis(rs_len: int, lt_len: int, user_id: int, dialogue_id: str):
        """
        Updates the Redis queues for recursive summary and long-term memory.
        """
        rs_key = f"{redis_enum.RedisEnum.RECURSIVE_SUMMARY.value}:{user_id}:{dialogue_id}"
        lt_key = f"{redis_enum.RedisEnum.LONG_TERM_MEMORY.value}:{user_id}:{dialogue_id}"

        if rs_len + 1 <= RECURSIVE_SUMMARY_MAX_LENGTH:
            increase_key(rs_key, amount=1)
        else:
            decrease_key(rs_key, amount=RECURSIVE_SUMMARY_MAX_LENGTH)

        if lt_len + 1 <= LONG_TERM_MEMORY_MAX_LENGTH:
            increase_key(lt_key, amount=1)
        else:
            decrease_key(lt_key, amount=LONG_TERM_MEMORY_MAX_LENGTH)

        print(
            f"Updated Redis: {rs_key}={get_key(rs_key)}, {lt_key}={get_key(lt_key)}")
