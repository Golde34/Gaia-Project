from core.abilities.abilitiy_routers import call_router_function
from core.domain.enums import redis_enum, kafka_enum
from core.domain.request.query_request import QueryRequest
from core.domain.request.chat_hub_request import RecentHistoryRequest
from core.semantic_router.router_registry import chat_history_route
from core.service.chat_service import reflection_chat_history, get_recursive_summary, get_long_term_memory
from infrastructure.client.chat_hub_service_client import chat_hub_service_client
from infrastructure.kafka.producer import send_kafka_message
from infrastructure.redis.redis import get_key, set_key, increase_key, decrease_key
from kernel.config.config import RECURSIVE_SUMMARY_MAX_LENGTH, LONG_TERM_MEMORY_MAX_LENGTH 


class ChatUsecase:
    @classmethod
    async def chat(cls, query: QueryRequest, chat_type: str):
        """
        Handles the user's chat request, including routing, updating query, and saving to history.
        
        Args:
            query (QueryRequest): User query request containing user_id, dialogue_id, and query text. 
            chat_type (str): Type of chat to be routed (e.g., task update, general chat, etc.).
        
        Returns:
            str: Response from the chat service after processing the query.
        """
        recent_history, recursive_summary, long_term_memory = await cls._route_chat_history(query)
        
        new_prompt = reflection_chat_history(
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory,
            query=query.query,
        )
        query.query = new_prompt
        response = await call_router_function(label_value=chat_type, query=query)
        await cls.update_chat_history(query=query, response=response)
        
        return response

    @classmethod
    async def _route_chat_history(cls, query: QueryRequest):
        """
        Routes the request based on semantic guidance, querying different memory sources.
        """
        semantic_response = await chat_history_route(query=query.query)
        
        recent_history = recursive_summary = long_term_memory = ''
        if semantic_response.get('recent_history'):
            recent_history = await chat_hub_service_client.get_recent_history(
                RecentHistoryRequest(user_id=query.user_id, dialogue_id=query.dialogue_id)
            )
        
        if semantic_response.get('recursive_summary'):
            recursive_summary = await get_recursive_summary(query.user_id, query.dialogue_id)
        
        if semantic_response.get('long_term_memory'):
            long_term_memory = await get_long_term_memory(query.user_id, query.dialogue_id, query.query)
        
        return recent_history, recursive_summary, long_term_memory

    @classmethod
    async def update_chat_history(cls, query: QueryRequest, response: str):
        """
        Updates the chat history with the new query and response, including managing Redis queues.
        """
        rs_len, lt_len = cls._check_redis(user_id=query.user_id, dialogue_id=query.dialogue_id)
        if rs_len >= RECURSIVE_SUMMARY_MAX_LENGTH:
            await cls._update_recursive_summary(query.user_id, query.dialogue_id)
        
        if lt_len >= LONG_TERM_MEMORY_MAX_LENGTH:
            await cls._update_long_term_memory(query.user_id, query.dialogue_id)

        cls._update_redis(rs_len, lt_len, query.user_id, query.dialogue_id)

    @staticmethod
    def _check_redis(user_id: str, dialogue_id: str):
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
    async def _update_recursive_summary(cls, user_id: str, dialogue_id: str):
        """
        Sends a Kafka message to update the recursive summary.
        """
        payload = {"user_id": user_id, "dialogue_id": dialogue_id}
        await send_kafka_message(kafka_enum.KafkaTopic.UPDATE_RECURSIVE_SUMMARY.value, payload)

    @classmethod
    async def _update_long_term_memory(cls, user_id: str, dialogue_id: str):
        """
        Sends a Kafka message to update the long-term memory.
        """
        payload = {"user_id": user_id, "dialogue_id": dialogue_id}
        await send_kafka_message(kafka_enum.KafkaTopic.UPDATE_LONG_TERM_MEMORY.value, payload)

    @staticmethod
    def _update_redis(rs_len: int, lt_len: int, user_id: str, dialogue_id: str):
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
        
        print(f"Updated Redis: {rs_key}={get_key(rs_key)}, {lt_key}={get_key(lt_key)}")
