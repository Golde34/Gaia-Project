from typing import List
from pydantic import BaseModel


class MessageResponseDTO(BaseModel):
    message: str
    metadata: str

class RecentHistory(BaseModel):
    user_id: int
    dialogue_id: str
    messages: List[MessageResponseDTO]
