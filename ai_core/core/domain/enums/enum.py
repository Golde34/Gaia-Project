from enum import Enum


class ChatType(Enum):
    ABILITIES = "abilities"
    GAIA_INTRODUCTION = "gaia_introduction"
    REGISTER_SCHEDULE_CALENDAR = "register_schedule_calendar" 

class ModelMode(Enum):
    LOCAL = "local"
    VLLM = "vllm"
    CLOUD = "cloud"

class SemanticRoute(Enum):
    GAIA_INTRODUCTION = "gaia_introduction"
    CHITCHAT = "chitchat"
    RECENT_HISTORY = "recent_history"
    RECURSIVE_SUMMARY = "recursive_summary"
    LONG_TERM_MEMORY = "long_term_memory"

class GaiaAbilities(Enum):
    CHITCHAT = "chitchat"
    CREATE_TASK = "create_task"
    CREATE_TASK_RESULT = "create_task_result"

