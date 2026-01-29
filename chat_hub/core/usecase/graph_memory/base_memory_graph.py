import time
from typing import Dict, Any, Optional
from dataclasses import dataclass, field

from core.domain.enums.enum import SenderTypeEnum


@dataclass
class MessageNode:
    node_id: str
    content: str
    wbos: Dict[str, Any]  # WBOS properties: W(World), B(Experience), O(Opinion), S(Observation)
    confidence: float
    role: SenderTypeEnum
    tool: str
    timestamp: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "content": self.content,
            "wbos": self.wbos,
            "confidence": self.confidence,
            "role": self.role.value,
            "tool": self.tool,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MessageNode':
        return cls(
            node_id=data.get("node_id"),
            content=data.get("content"),
            wbos=data.get("wbos", {}),
            confidence=float(data.get("confidence", 0)),
            role=SenderTypeEnum(data.get("role")),
            tool=data.get("tool", ""),
            timestamp=float(data.get("timestamp", time.time()))
        )


class BaseMemoryGraph:
    def __init__(self):
        self.nodes: Dict[str, MessageNode] = {}
        self.active_window: list = []
        self.max_window_size: int = 10
    
    def add_node(self, node: MessageNode) -> None:
        self.nodes[node.node_id] = node
        self.active_window.insert(0, node.node_id)
        
        if len(self.active_window) > self.max_window_size:
            self._evict_oldest_node()
    
    def get_node(self, node_id: str) -> Optional[MessageNode]:
        return self.nodes.get(node_id)
    
    def get_recent_nodes(self, limit: int = 10) -> list[MessageNode]:
        recent_ids = self.active_window[:limit]
        return [self.nodes[nid] for nid in recent_ids if nid in self.nodes]
    
    def _evict_oldest_node(self) -> Optional[str]:
        if self.active_window:
            old_node_id = self.active_window.pop()
            # TODO: Đẩy node này xuống STAG trước khi xóa
            if old_node_id in self.nodes:
                del self.nodes[old_node_id]
            return old_node_id
        return None
    
    def find_nodes_by_wbos(self, wbos_type: str, value: str) -> list[MessageNode]:
        result = []
        for node in self.nodes.values():
            if node.wbos.get(wbos_type) == value:
                result.append(node)
        return result
