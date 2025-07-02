from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RecursiveSummary(BaseModel):
    id: Optional[int] = None
    user_id: str
    dialogue_id: str
    summary: str
    created_at: Optional[datetime] = None
