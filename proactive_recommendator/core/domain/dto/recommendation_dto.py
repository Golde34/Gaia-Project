from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class SimilarityLabel(BaseModel):
    name: str
    score: float
    embedding: Optional[List] = None

class RecommendationEvent():
    context_id: str = None
    user_id: int
    query: str
    candidates: List[SimilarityLabel]
    query_vec: List[float]

# @dataclass
# class UserContext:
#     busy_minutes: int
#     free_blocks: List[Dict[str, Any]]
#     conflicts: List[Dict[str, str]]
