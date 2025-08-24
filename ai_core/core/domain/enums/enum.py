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
    REGISTER_SCHEDULE_CALENDAR = "register_schedule_calendar"
    REGISTER_SCHEDULE_CALENDAR_EXAMPLE = "register_schedule_calendar_example"

class GaiaAbilities(Enum):
    CHITCHAT = "chitchat"
    CREATE_TASK = "create_task"
    CREATE_TASK_RESULT = "create_task_result"
    REGISTER_SCHEDULE_CALENDAR = "register_schedule_calendar"

class VectorDBContext(Enum):
    GAIA_INTRODUCTION = "Gaia Introduction"

class TagEnum(Enum):
    WORK = "work",
    EAT = "eat",
    RELAX = "relax",
    TRAVEL = "travel",
    SLEEP = "sleep"

TAG_LIST = [TagEnum.WORK, TagEnum.EAT, TagEnum.RELAX, TagEnum.TRAVEL, TagEnum.SLEEP]
