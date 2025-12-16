from typing import List, Optional

from pydantic import BaseModel

from kernel.utils.parse_json import to_camel


class ToolRequest(BaseModel):
    tool: str
    description: str
    json_schema: Optional[dict] = None
    sample_queries: Optional[List[str]] = None
    need_history: bool = False
    is_active: bool = True

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True,
    }


class ToolVectorRequest(BaseModel):
    tool: str
    description: str
    sample_queries: List[str]

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True,
    }
