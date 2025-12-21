from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel

from kernel.utils.parse_json import to_camel


class UserDialogue(BaseModel):
    id: uuid.UUID = None
    user_id: int 
    dialogue_name: str
    dialogue_type: str
    dialogue_status: bool
    metadata: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True
    }