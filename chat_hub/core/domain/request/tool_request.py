from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from kernel.utils.parse_json import to_camel


class ToolRequest(BaseModel):
    tool: str = Field(..., min_length=1, description="Tool name")
    description: str = Field(..., min_length=1, description="Tool description")
    json_schema: Optional[dict] = None
    sample_queries: List[str] = Field(..., min_items=1, max_items=50, description="Sample queries for the tool")
    need_history: bool = True
    is_active: bool = True

    @field_validator("tool", "description")
    @classmethod
    def validate_not_whitespace(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field must not be empty or contain only whitespace")
        return v.strip()

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
