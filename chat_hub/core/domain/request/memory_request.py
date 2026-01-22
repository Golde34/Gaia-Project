from pydantic import BaseModel


class MemoryRequest(BaseModel):
    user_id: int
    dialogue_id: str
    is_change_title: bool = False

class MemoryRecallDto(BaseModel):
    query: str
    reflected_query: str
    recent_history: str
    summarized_history: str