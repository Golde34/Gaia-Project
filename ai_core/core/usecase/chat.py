from core.abilities.abilitiy_routers import call_router_function 
from core.domain.enums import redis_enum, kafka_enum 
from core.domain.request.query_request import QueryRequest
from core.domain.request.chat_hub_request import RecentHistoryRequest
from core.prompts.system_prompt import CHAT_HISTORY_PROMPT 
from core.semantic_router.router_registry import chat_history_route
from infrastructure.client.chat_hub_service_client import chat_hub_service_client 
from infrastructure.kafka.producer import send_kafka_message 
from infrastructure.redis.redis import get_key, set_key, increase_key, decrease_key 
from infrastructure.repository.recursive_summary_repository import recursive_summary_repo 


recursive_summary_max_length_config = 3
long_term_memory_max_length_config = 10

class ChatUsecase:
    @classmethod
    async def chat(cls, query: QueryRequest, chat_type: str):
        """
        Handle the chat - only fix this script if you want to change logic of the chat service.

        Args:
            query (QueryRequest): User query request containing user_id, dialogue_id, and query text. 
            chat_type (str): Router of chat type 

        Returns:
            response (str): Response from the chat service after processing the query. 
        """
        recent_history, recursive_summary, long_term_memory = await cls._chat_history_semantic_router(query=query)
        new_prompt = cls._reflection(recent_history=recent_history, recursive_summary=recursive_summary, long_term_memory=long_term_memory, query=query.query)
        query.query = new_prompt
        response = await call_router_function(label_value=chat_type, query=query)
        await cls._update_chat_history(query=query, response=response)
        return response 

    @classmethod
    async def _chat_history_semantic_router(cls, query: QueryRequest):
        """
        If semantic router guides to recent history, recursive summary or long term memory,
        We must inquiry the chat history samples to determine the next step.
        """
        semantic_response = await chat_history_route(query=query.query) 
        recent_history = recursive_summary = long_term_memory = ''
        if semantic_response['recent_history'] == True:
            recent_history = chat_hub_service_client.get_recent_history(
                RecentHistoryRequest(
                    user_id=query.user_id,
                    dialogue_id=query.dialogue_id,
                )
            ) 
        if semantic_response['recursive_summary'] == True:
            print('Call redis to get recursive summary')
            recursive_summary = cls._get_recursive_summary_content(
                user_id=query.user_id,
                dialogue_id=query.dialogue_id
            )
        if semantic_response['long_term_memory'] == True:
            print('Call vector database to get long term memory')
            long_term_memory = ''
        return recent_history, recursive_summary, long_term_memory

    @staticmethod
    def _get_recursive_summary_content(user_id: str, dialogue_id: str):
        """
        Get the recursive summary content from Redis.
        """
        try:
            recursive_summary_content = ''
            recursive_summary_key = redis_enum.RedisEnum.RECURSIVE_SUMMARY_CONTENT.value + f":{user_id}:{dialogue_id}"
            recursive_summary_content = get_key(recursive_summary_key)
            if not recursive_summary_content:
                recursive_summary_content = recursive_summary_repo.list_by_dialogue(
                    user_id=user_id,
                    dialogue_id=dialogue_id
                ) 
            return recursive_summary_content 
        except Exception as e:
            print(f"Error in _get_recursive_summary_content: {e}")
            return ''

    @staticmethod
    def _reflection(recent_history: str, recursive_summary: str, long_term_memory: str, query: str):
        """
        Generate a new prompt based on the recent history, recursive summary, long term memory, and the current query.
        This function can be customized to reflect the conversation context.
        """
        new_prompt = CHAT_HISTORY_PROMPT.format(
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory,
            query=query
        )
        print(f"New prompt generated: {new_prompt}")
        return new_prompt

    @classmethod
    async def _update_chat_history(cls, query: QueryRequest, response: str):
        """
        Update the chat history with the new query and response.
        """
        rs_queue_length, lt_queue_length = cls._check_redis(user_id=query.user_id, dialogue_id=query.dialogue_id)
        # await cls._update_recent_history()
        if rs_queue_length >= recursive_summary_max_length_config:
            await cls._update_recursive_history(query.user_id, query.dialogue_id)
        # await cls._update_long_term_memory()
        # await cls._update_redis()
        cls._update_redis(rs_queue_length, lt_queue_length, query.user_id, query.dialogue_id)

    @staticmethod
    def _check_redis(user_id: str = None, dialogue_id: str = None):
        recursive_summary_key = redis_enum.RedisEnum.RECURSIVE_SUMMARY.value + f":{user_id}:{dialogue_id}" 
        long_term_memory_key = redis_enum.RedisEnum.LONG_TERM_MEMORY.value + f":{user_id}:{dialogue_id}"

        recursive_summary_queue_length = get_key(recursive_summary_key) or ChatUsecase.__set_key_ttl(recursive_summary_key) 
        long_term_memory_queue_length = get_key(long_term_memory_key) or ChatUsecase.__set_key_ttl(long_term_memory_key) 
        return recursive_summary_queue_length, long_term_memory_queue_length

    @staticmethod
    def __set_key_ttl(key: str):
        set_key(key, value=0, ttl=3600)
        return 0

    @classmethod
    async def _update_recursive_history(cls, user_id: str, dialogue_id: str):
        """
        Update the recursive summary history in the database.
        This function can be customized to save the recursive summary to a database or other storage.
        """
        # Placeholder for actual implementation
        print("Updating recursive history...")
        payload = {
            "user_id": user_id,
            "dialogue_id": dialogue_id,
        }
        send_kafka_message(kafka_enum.KafkaTopic.UPDATE_RECURSIVE_SUMMARY.value, payload)        

    @staticmethod
    def _update_redis(rs_queue_length: int, lt_queue_length: int, user_id: str, dialogue_id: str):
        """
        Update the redis queue length for recent history and long term memory.
        """
        print(f"Current Redis: rs_queue_length={rs_queue_length}, lt_queue_length={lt_queue_length}")
        

        recursive_summary_key = redis_enum.RedisEnum.RECURSIVE_SUMMARY.value + f":{user_id}:{dialogue_id}" 
        long_term_memory_key = redis_enum.RedisEnum.LONG_TERM_MEMORY.value + f":{user_id}:{dialogue_id}"

        current_rs_length = int(rs_queue_length) + 1
        current_lt_length = int(lt_queue_length) + 1

        if current_rs_length < recursive_summary_max_length_config:
            increase_key(recursive_summary_key, amount=1)
        elif current_rs_length == recursive_summary_max_length_config:
            decrease_key(recursive_summary_key, amount=recursive_summary_max_length_config)
        if current_lt_length < long_term_memory_max_length_config:
            increase_key(long_term_memory_key, amount=1)
        elif current_lt_length == long_term_memory_max_length_config:
            decrease_key(long_term_memory_key, amount=long_term_memory_max_length_config)

        print(f"Updated Redis: {recursive_summary_key}={get_key(recursive_summary_key)}, {long_term_memory_key}={get_key(long_term_memory_key)}")
