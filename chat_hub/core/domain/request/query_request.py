from typing import Optional
from pydantic import BaseModel
from fastapi import UploadFile


class LLMModel(BaseModel):
    model_name: str
    model_key: str


class QueryRequest(BaseModel):
    user_id: int
    dialogue_id: str
    query: str
    model: LLMModel
    type: str
    user_message_id: Optional[str] = None


class RAGRequest(BaseModel):
    file: UploadFile
    