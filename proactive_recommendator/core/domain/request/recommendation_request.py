from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    query: str
    user_id: int
