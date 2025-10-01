from enum import Enum


class RedisEnum(str, Enum):
    PREFIX = "proactive_recommendation:"

    USER_INFORMATION = PREFIX + "user_information:"
    PRIORITY_TASKS = PREFIX + "priority_tasks:"
    