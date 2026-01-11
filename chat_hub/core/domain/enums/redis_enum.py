from enum import Enum


class RedisEnum(str, Enum):
    RECENT_HISTORY = "chat_hub:recent_history"
    RECURSIVE_SUMMARY = "chat_hub:recursive_summary"
    LONG_TERM_MEMORY = "chat_hub:long_term_memory"

    RECURSIVE_SUMMARY_CONTENT = "chat_hub:recursive_summary_content"

    USER_DIALOGUE = "chat_hub:user_dialogue"
    AI_DIALOGUE = "chat_hub:ai_dialogue"

    USER_LLM_MODEL = "chat_hub:user_llm_model"

    ABILITY_TASK_STATUS = "chat_hub:ability_task_status"
    
    USER_PROJECT_LIST = "chat_hub:user_project_list"
    USER_GROUP_TASK_LIST = "chat_hub:user_group_task_list"