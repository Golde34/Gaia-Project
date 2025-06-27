from pydantic import BaseModel
from fastapi import UploadFile


class QueryRequest(BaseModel):
    user_id: str
    dialogue_id: str
    query: str
    model_name: str

class SystemRequest(BaseModel):
    query: str
    type: str = "chitchat"
    dialogue_id: str 

class RAGRequest(BaseModel):
    file: UploadFile
    