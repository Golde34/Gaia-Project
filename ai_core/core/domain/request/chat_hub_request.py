from pydantic import BaseModel

class RecentHistoryRequest(BaseModel):
    user_id: str
    dialogue_id: str
    number_of_messages: int = 5