from enum import Enum


class KafkaTopic(str, Enum):
    ## Internal topics
    UPDATE_RECURSIVE_SUMMARY = "ai-core.update-recursive-summary.topic"
    UPDATE_LONG_TERM_MEMORY = "ai-core.update-long-term-memory.topic"
    CALLING_LLM_API_TIMES = "ai-core.calling-llm-api-times.topic"
    REGISTER_CALENDAR_SCHEDULE = "ai-core.register-calendar-schedule.topic"
    ## Producer topics
    GENERATE_CALENDAR_SCHEDULE = "ai-core.generate-calendar-schedule.topic"
    ABILITY_TASK_RESULT = "ai-core.ability-task-result.topic"
    PUSH_MESSAGE = "ai-core.push-message.topic"

class KafkaCommand(str, Enum):
    GENERATE_CALENDAR_SCHEDULE = "gaiaRegisterCalendar"