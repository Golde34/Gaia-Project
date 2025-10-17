from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel


class RecommendationHistory(BaseModel):
    id: uuid.UUID = None
    user_id: str
    dialogue_id: str
    fingerprint: str
    recommendation: str
    created_at: Optional[datetime] = None
