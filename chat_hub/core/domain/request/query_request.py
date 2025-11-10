from typing import Optional
from pydantic import BaseModel
from fastapi import UploadFile


class QueryRequest(BaseModel):
    user_id: int 
    dialogue_id: str
    query: str
    model_name: str
    type: str
    user_message_id: Optional[str] = None

class RAGRequest(BaseModel):
    file: UploadFile
    