from typing import Optional
from pydantic import BaseModel
from fastapi import UploadFile

from kernel.utils.parse_json import to_camel


class LLMModel(BaseModel):
    model_name: str
    model_key: str
    memory_model: str

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True
    }


class QueryRequest(BaseModel):
    user_id: int
    dialogue_id: str
    query: str
    model: LLMModel
    type: str
    user_message_id: Optional[str] = None


class RAGRequest(BaseModel):
    file: UploadFile
    