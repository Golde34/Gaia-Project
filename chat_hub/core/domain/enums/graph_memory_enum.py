from enum import Enum


class WBOSEnum(Enum):
    WORLD = "W"
    EXPERIENCE = "E"
    OPINION = "O"
    OBSERVATION = "S"


class GraphRoutingDecision(Enum):
    SLM = "slm"
    STAG = "stag"
    LLM = "llm"
