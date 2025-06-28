from enum import Enum


class RedisEnum(str, Enum):
    RECENT_HISTORY = "ai_core:recent_history"
    RECURSIVE_SUMMARY = "ai_core:recursive_summary"
    LONG_TERM_MEMORY = "ai:long_term_memory"

    USER_DIALOGUE = "ai_core:user_dialogue"
    AI_DIALOGUE = "ai_core:ai_dialogue"
