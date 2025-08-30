from pydantic import BaseModel
from fastapi import UploadFile


class QueryRequest(BaseModel):
    user_id: str
    dialogue_id: str
    query: str
    model_name: str
    type: str

class RAGRequest(BaseModel):
    file: UploadFile
    