from enum import Enum


class KafkaTopic(str, Enum):
    ## Internal topics
    TEST = "test"
    ## Producer topics

class KafkaCommand(str, Enum):
    TEST = "test"