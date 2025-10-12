from pydantic import BaseModel
from typing import Dict, Optional, List


class LabelNode(BaseModel):
    name: str
    type: str
    aliases: List[str]
    description: Optional[str]
    version: int
    active: bool
    metadata: Optional[Dict] 

class ProviderNode(BaseModel):
    name: str
    description: Optional[str]
    active: bool
    metadata: Optional[Dict]