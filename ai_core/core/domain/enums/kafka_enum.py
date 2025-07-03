from enum import Enum


class KafkaTopic(str, Enum):
    UPDATE_RECURSIVE_SUMMARY = "ai-core.update-recursive-summary.topic"
    UPDATE_LONG_TERM_MEMORY = "ai-core.update-long-term-memory.topic"