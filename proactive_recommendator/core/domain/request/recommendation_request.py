from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    context_id: str = None
    query: str
    user_id: int
