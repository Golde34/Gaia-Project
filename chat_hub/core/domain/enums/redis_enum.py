from enum import Enum


class RedisEnum(str, Enum):
    RECURSIVE_SUMMARY = "ai_core:recursive_summary"
    LONG_TERM_MEMORY = "ai_core:long_term_memory"

    RECURSIVE_SUMMARY_CONTENT = "ai_core:recursive_summary_content"

    USER_DIALOGUE = "chat_hub:user_dialogue"
    AI_DIALOGUE = "chat_hub:ai_dialogue"

    USER_LLM_MODEL = "chat_hub:user_llm_model"

    ABILITY_TASK_STATUS = "chat_hub:ability_task_status"
    
    USER_PROJECT_LIST = "ai_core:user_project_list"
    USER_GROUP_TASK_LIST = "ai_core:user_group_task_list"