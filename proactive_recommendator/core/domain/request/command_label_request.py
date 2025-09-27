from typing import List
from pydantic import BaseModel


class CommandLabelRequest(BaseModel):
    label: str
    name: str
    keywords: List[str]
    example: List[str]
    description: str
