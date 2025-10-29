from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel

from kernel.utils.parse_json import to_camel


class Message(BaseModel):
    id: uuid.UUID = None
    user_id: int 
    dialogue_id: uuid.UUID 
    user_message_id: Optional[str] = None
    message_type: str
    sender_type: str
    content: str
    metadata: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True
    }