from enum import Enum


class KafkaTopic(str, Enum):
    ## Internal topics
    TEST = "test"
    ## Producer topics
    ## Consumer topics
    PERSONAL_TASK = "proactive_recommendator.personal_task.topic"

class KafkaCommand(str, Enum):
    TEST = "test"
    PROJECT_LIST = "projectListCommand"
    GROUP_TASK_LIST = "groupTaskListCommand"
    DAILY_CALENDAR = "dailyCalendarCommand"
    TASK_LIST = "taskListCommand"