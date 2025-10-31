from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel


class RecursiveSummary(BaseModel):
    id: uuid.UUID = None
    user_id: int 
    dialogue_id: str
    summary: str
    created_at: Optional[datetime] = None
