from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel


class RecommendationHistory(BaseModel):
    id: uuid.UUID = None
    user_id: int 
    dialogue_id: str
    recommendation: str
    tool: str
    status: str
    created_at: Optional[datetime] = None
