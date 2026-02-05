from core.domain.entities.vectordb import long_term_memory, tool, root_memory
from core.domain.enums.redis_enum import RedisEnum
from infrastructure.redis.redis import delete_key


def clear_user_llm_config(user_id: str):
    user_model_key = f"{RedisEnum.USER_LLM_MODEL.value}:{user_id}"
    delete_key(user_model_key)


def create_vectordb_collections():
    long_term_memory.long_term_memory_entity.create_collection()
    tool.tool_vector_entity.create_collection()
    root_memory.root_memory_entity.create_collection()
