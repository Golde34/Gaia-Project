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
    CHITCHAT_AND_REGISTER_CALENDAR = "chitchat_and_register_calendar"


class GaiaAbilities(Enum):
    CHITCHAT = "chitchat"
    CREATE_TASK = "create_personal_task"
    CREATE_TASK_RESULT = "create_task_result"
    REGISTER_SCHEDULE_CALENDAR = "register_schedule_calendar"
    SEARCH = "search"
    PROJECT_LIST = "project_list"
    GROUP_TASK_LIST = "group_task_list"


class TaskStatus(str, Enum):
    INIT = "INIT"
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class VectorDBContext(Enum):
    GAIA_INTRODUCTION = "Gaia Introduction"


class DialogueEnum(Enum):
    GAIA_INTRODUCTION = "Gaia Introduction"
    GAIA_INTRODUCTION_TYPE = "gaia_introduction"
    REGISTER_SCHEDULE_CALENDAR = "Register Schedule Calendar"
    REGISTER_SCHEDULE_CALENDAR_TYPE = "register_calendar"
    CHAT_TYPE = "chitchat_message"


class ActiveEnum(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ACTIVE_BOOL = True
    INACTIVE_BOOL = False


class SenderTypeEnum(Enum):
    USER = "user"
    BOT = "bot"


class MemoryModel(Enum):
    DEFAULT = "Default Model"
    GRAPH = "Graph Model"


class ServiceEnum(Enum):
    SELF = "chat_hub"
    AUTHENTICATION_SERVICE = "authentication_service"
    TASK_MANGER = "task_manager"
    SCHEDULE_PLAN = "schedule_plan"
    MIDDLEWARE_LOADER = "middleware_loader"
    PROACTIVE_RECOMMENDATOR = "proactive_recommendator"


class MessageType:
    MESSAGE_START = "message_start"
    MESSAGE_CHUNK = "message_chunk"
    MESSAGE_END = "message_end"
    MESSAGE_COMPLETE = "message_complete"
    ERROR = "error"
    SUCCESS = "success"  # SSE event for client to close connection
    FAILURE = "failure"  # SSE event for client to close connection
    SUCCESS_MESSAGE = "SUCCESS"  # Internal status from chat_usecase
    FAILURE_MESSAGE = "FAILURE"  # Internal status from chat_usecase


class RecommendationStatusEnum(Enum):
    WAITING = "waiting"
    RECOMMENDED = "recommended"
    SUGGEST = "suggest"
    OUTDATED = "outdated"