from pydantic import BaseModel
from fastapi import UploadFile


class QueryRequest(BaseModel):
    user_id: str
    query: str
    model_name: str

class SystemRequest(BaseModel):
    query: str
    type: str = "chitchat"

class RAGRequest(BaseModel):
    file: UploadFile
    