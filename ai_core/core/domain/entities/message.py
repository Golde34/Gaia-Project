from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel


class Message(BaseModel):
    id: uuid.UUID = None
    user_id: str
    dialogue_id: str
    user_message_id: Optional[str] = None
    message_type: str
    sender_type: str
    content: str
    metadata: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
