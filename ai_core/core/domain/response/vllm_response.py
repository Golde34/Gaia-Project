from typing import Dict, List
from pydantic import BaseModel


class VllmEmbeddingResponseData(BaseModel):
    object: str
    embedding: list[float]
    index: int

class VllmEmbeddingResponse(BaseModel):
    object: str
    data: List[VllmEmbeddingResponseData]
    model: str
    usage: Dict[str, int]
    id: str
    created: int