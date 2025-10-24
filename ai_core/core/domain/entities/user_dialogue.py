from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel


class UserDialogue(BaseModel):
    id: uuid.UUID = None
    user_id: str
    dialogue_name: str
    dialogue_type: str
    dialogue_status: bool
    metadata: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
