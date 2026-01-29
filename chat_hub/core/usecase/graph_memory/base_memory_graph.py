import time
from typing import Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class MessageNode:
    """Node đại diện cho một message trong graph"""
    node_id: str
    content: str
    wbos: Dict[str, Any]  # WBOS properties: W(World), B(Behavior), O(Opinion), S(Summary)
    confidence: float
    role: str  # 'user' hoặc 'assistant'
    timestamp: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict[str, Any]:
        """Chuyển Node thành dict để lưu vào Redis"""
        return {
            "node_id": self.node_id,
            "content": self.content,
            "wbos": self.wbos,
            "confidence": self.confidence,
            "role": self.role,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MessageNode':
        """Tạo Node từ dict lấy ra từ Redis"""
        return cls(
            node_id=data.get("node_id"),
            content=data.get("content"),
            wbos=data.get("wbos", {}),
            confidence=float(data.get("confidence", 0)),
            role=data.get("role"),
            timestamp=float(data.get("timestamp", time.time()))
        )


class BaseMemoryGraph:
    """
    Base class cho Memory Graph
    Định nghĩa cấu trúc cơ bản của graph lưu trữ message và WBOS properties
    """
    
    def __init__(self):
        self.nodes: Dict[str, MessageNode] = {}
        self.active_window: list = []  # List các node_id trong RAM
        self.max_window_size: int = 10  # Tối đa 10 nodes trong RAM
    
    def add_node(self, node: MessageNode) -> None:
        """Thêm node vào graph"""
        self.nodes[node.node_id] = node
        self.active_window.insert(0, node.node_id)
        
        # Evict node cũ nếu vượt quá window size
        if len(self.active_window) > self.max_window_size:
            self._evict_oldest_node()
    
    def get_node(self, node_id: str) -> Optional[MessageNode]:
        """Lấy node theo ID"""
        return self.nodes.get(node_id)
    
    def get_recent_nodes(self, limit: int = 10) -> list[MessageNode]:
        """Lấy các node gần nhất từ active window"""
        recent_ids = self.active_window[:limit]
        return [self.nodes[nid] for nid in recent_ids if nid in self.nodes]
    
    def _evict_oldest_node(self) -> Optional[str]:
        """Xóa node cũ nhất khỏi active window"""
        if self.active_window:
            old_node_id = self.active_window.pop()
            # TODO: Đẩy node này xuống STAG trước khi xóa
            if old_node_id in self.nodes:
                del self.nodes[old_node_id]
            return old_node_id
        return None
    
    def find_nodes_by_wbos(self, wbos_type: str, value: str) -> list[MessageNode]:
        """Tìm nodes theo WBOS properties"""
        result = []
        for node in self.nodes.values():
            if node.wbos.get(wbos_type) == value:
                result.append(node)
        return result
