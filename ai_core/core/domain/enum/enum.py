from enum import Enum


class ModelMode(Enum):
    LOCAL = "local"
    VLLM = "vllm"
    CLOUD = "cloud"

class SemanticRoute(Enum):
    GAIA_INTRODUCTION = "gaia_introduction"
    CHITCHAT = "chitchat"

class TaskServiceRoute(Enum):
    CHITCHAT = "chitchat"
    "CREATE_TASK" = "create_task"