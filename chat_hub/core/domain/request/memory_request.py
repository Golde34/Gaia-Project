from pydantic import BaseModel


class MemoryRequest(BaseModel):
    user_id: int
    dialogue_id: str
    is_change_title: bool = False

class MemorySelectionToolDto(BaseModel):
    query: str
    reflected_query: str
    last_bot_message: str
    used_tools: list[str]

class MemoryDto(BaseModel):
    recent_history: str
    recursive_summary: str
    longterm_memory: str
    used_tools: list[str]
