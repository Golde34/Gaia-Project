from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel

from kernel.utils.parse_json import to_camel


class AgentExecution(BaseModel):
    id: uuid.UUID = None
    user_id: int 
    message_id: uuid.UUID
    selected_tool_id: Optional[str] = None 
    user_query: str
    # if bot score confidence low, we may not use the tool 
    # or ask user, or pending and do task again
    confidence_score: Optional[float] = None 
    tool_input: Optional[str] = None
    tool_output: Optional[str] = None
    status: str # Init, Pending, In-Progress, Success, Failed
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True
    }