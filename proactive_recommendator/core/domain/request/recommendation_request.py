from typing import List
from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    dialogue_id: str = None
    query: str
    user_id: int
    waiting_recommendations: List[str] 

class RecommendationInfoRequest(BaseModel):
    query: str
    user_id: int
