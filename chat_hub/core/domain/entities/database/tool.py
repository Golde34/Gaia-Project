from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from kernel.utils.parse_json import to_camel


class Tool(BaseModel):
    tool: str
    description: str
    json_schema: Optional[dict] = None
    sample_queries: List[str] = Field(default_factory=list)
    need_history: bool = False
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True,
    }
