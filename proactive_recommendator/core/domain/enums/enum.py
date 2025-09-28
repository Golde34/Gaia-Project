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