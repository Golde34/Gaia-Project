from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from core.domain.enums.enum import LabelNodeType

class LabelNode(BaseModel):
    name: str
    type: LabelNodeType = LabelNodeType.INTENT
    aliases: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    version: int = 1
    active: bool = True
    metadata: Optional[Dict] = None

class ProviderNode(BaseModel):
    name: str
    description: Optional[str] = None
    active: bool = True
    metadata: Optional[Dict] = None

class FlowNode(BaseModel):
    name: str
    description: Optional[str] = None
    active: bool = True

## Relationship
class RequiresEdge(BaseModel):
    src: str
    dst: str
    w: float = 1.0
    source: Optional[str] = "manual"
    version: int = 1

class ExcludesEdge(BaseModel):
    a: str
    b: str
    w: float = 1.0
    source: Optional[str] = "manual"
    version: int = 1

class CoOccurEdge(BaseModel):
    src: str
    dst: str
    pmi: Optional[float] = None
    w: Optional[float] = None
    count12: Optional[int] = None
    source: Optional[str] = "stats"

class SimilarEdge(BaseModel):
    src: str
    dst: str
    sim: float
    w: Optional[float] = None
    source: Optional[str] = "embedding"

class BelongsEdge(BaseModel):
    label: str
    flow: str
    role: Optional[str] = None

class HandlesEdge(BaseModel):
    provider: str
    label: str
    priority: int = 0
