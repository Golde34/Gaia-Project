from pydantic import BaseModel


class QueryRequest(BaseModel):
    user_id: str
    query: str
    model_name: str

class SystemRequest(BaseModel):
    query: str
    type: str = "chitchat"