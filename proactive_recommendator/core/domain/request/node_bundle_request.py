from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, List

from core.domain.entities.graphdb.label_node_entity import LabelNode, ProviderNode
from core.domain.enums.enum import NodeBundleKind


class NodeDescriptor(BaseModel):
    kind: Literal["label", "provider"]
    label: Optional[LabelNode] = None
    provider: Optional[ProviderNode] = None

    @field_validator(NodeBundleKind.LABEL.value, always=True)
    def _val_label(cls, v, values):
        if values.get(NodeBundleKind.KIND_FIELD.value) == NodeBundleKind.LABEL.value and v is None:
            raise ValueError("label must be provided when kind is 'label'")
        return v

    @field_validator(NodeBundleKind.PROVIDER.value, always=True)
    def _val_provider(cls, v, values):
        if values.get(NodeBundleKind.KIND_FIELD.value) == NodeBundleKind.PROVIDER.value and v is None:
            raise ValueError(
                "provider must be provided when kind is 'provider'")
        return v


class LabelEdgeRequires(BaseModel):
    to: str
    w: float = 1.0
    source: Optional[str] = "api"
    version: int = 1


class LabelEdgeExcludes(BaseModel):
    with_label: str
    w: float = 1.0
    source: Optional[str] = "api"
    version: int = 1


class LabelEdgeCoOccur(BaseModel):
    with_label: str
    pmi: Optional[float] = None
    w: Optional[float] = None
    count12: Optional[int] = None
    source: Optional[str] = "api"


class LabelEdgeSimilar(BaseModel):
    with_label: str
    sim: float
    w: Optional[float] = None
    source: Optional[str] = "api"


class LabelConnections(BaseModel):
    requires: List[LabelEdgeRequires] = Field(default_factory=list)
    excludes: List[LabelEdgeExcludes] = Field(default_factory=list)
    co_occur: List[LabelEdgeCoOccur] = Field(default_factory=list)
    similar_to: List[LabelEdgeSimilar] = Field(default_factory=list)
    handled_by: List[str] = Field(default_factory=list)


class ProviderConnections(BaseModel):
    handles: List[str] = Field(default_factory=list)


class NodeBundle(BaseModel):
    node: NodeDescriptor
    connections: Optional[LabelConnections | ProviderConnections] = None
