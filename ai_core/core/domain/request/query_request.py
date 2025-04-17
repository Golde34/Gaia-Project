from pydantic import BaseModel


class TaskRequest(BaseModel):
    query: str