from enum import Enum


class ModelMode(Enum):
    LOCAL = "local"
    VLLM = "vllm"
    CLOUD = "cloud"

class SearchMode(Enum):
    VECTOR = "vector"
    # KEYWORD = "keyword"
    HYBRID = "hybrid"

class AggregateMode(Enum):
    MAX = "max"
    MEAN = "mean"
    SOFTMAX_MEAN = "softmax_mean"
    SUM = "sum"
    MIN = "min"
    NONE = "none"

class GaiaAbilities(Enum):
    CREATE_TASK = "create_task"
    LIST_TASK = "list_task"
    LIST_CALENDAR = "list_calendar"
    SEARCH_INFOR = "search_info"
