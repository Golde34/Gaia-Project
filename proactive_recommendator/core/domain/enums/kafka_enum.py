from enum import Enum


class KafkaTopic(str, Enum):
    ## Internal topics
    TEST = "test"
    ## Producer topics
    ## Consumer topics
    SYNCHRONIZE_MEMORY_TOPIC = "proactive-recommendator.synchronize-memory.topic"
    PERSONAL_TASK = "proactive-recommendator.personal-task.topic"

class KafkaCommand(str, Enum):
    TEST = "test"
    PROJECT_LIST = "projectListCommand"
    GROUP_TASK_LIST = "groupTaskListCommand"
    DAILY_CALENDAR = "dailyCalendarCommand"
    TASK_LIST = "taskListCommand"
    CREATE_PROJECT = "createProjectCommand"

    SYNC_PROJECT_MEMORY = "syncProjectMemoryCmd"
