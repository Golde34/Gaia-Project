from collections import defaultdict
from typing import List, Dict, Optional, Any, Callable
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from core.domain.enums.enum import SenderTypeEnum, WBOSEnum


@dataclass
class MessageNode:
    node_id: str
    topic: str
    tool: str
    content: str
    wbos: Dict[WBOSEnum, str]
    confidence: float
    role: SenderTypeEnum
    timestamp: float = field(default_factory=time.time)
    previous_node_id: Optional[str] = None
    topic_link_id: Optional[str] = None
    optional_links: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id, "topic": self.topic, "content": self.content,
            "wbos": {k.value if hasattr(k, 'value') else str(k): v for k, v in self.wbos.items()}, 
            "confidence": self.confidence, "role": self.role.value,
            "tool": self.tool, "timestamp": self.timestamp, "previous_node_id": self.previous_node_id,
            "topic_link_id": self.topic_link_id, "optional_links": self.optional_links
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MessageNode':
        # Convert string keys back to WBOSEnum
        wbos_data = data.get("wbos", {})
        wbos_dict = {}
        for key, value in wbos_data.items():
            try:
                # Try to convert string key to WBOSEnum
                enum_key = WBOSEnum(key)
                wbos_dict[enum_key] = value
            except (ValueError, KeyError):
                # If conversion fails, keep as string
                wbos_dict[key] = value
        
        return cls(
            node_id=data.get("node_id"), topic=data.get("topic", "default"),
            content=data.get("content"), wbos=wbos_dict,
            confidence=float(data.get("confidence", 0)), role=SenderTypeEnum(data.get("role")),
            tool=data.get("tool", ""), timestamp=float(data.get("timestamp", time.time())),
            previous_node_id=data.get("previous_node_id"), topic_link_id=data.get("topic_link_id"),
            optional_links=data.get("optional_links", [])
        )


class BaseGraphMemory:
    def __init__(self,
                 topic_limit: int = 10,
                 storage_callback: Optional[Callable] = None):
        self.nodes: Dict[str, MessageNode] = {}

        self.topic_index: Dict[str, List[str]] = defaultdict(list)
        self.topic_limit = topic_limit

        self.topic_observations: Dict[str, Dict[str, Any]] = {}

        self.storage_callback = storage_callback

    def add_node(self, node: MessageNode):
        # A. Cạnh thời gian (Temporal Link)
        last_node_id = self._get_last_node_id()
        if last_node_id:
            node.previous_node_id = last_node_id

        # B. Cạnh chủ đề (Topic Stitching)
        if node.topic:
            if self.topic_index[node.topic]:
                node.topic_link_id = self.topic_index[node.topic][-1]

            self.topic_index[node.topic].append(node.node_id)

        # C. Lưu vào RAM
        self.nodes[node.node_id] = node

        # D. Cập nhật Observation (S) tổng quát cho Topic - Bản chất Hindsight
        self._update_topic_observation(node)

        # E. Kiểm tra ngưỡng tràn Topic (Evict & Consolidate)
        if node.topic and len(self.topic_index[node.topic]) > self.topic_limit:
            self.evict_oldest_topic_node(node.topic)

    def _update_topic_observation(self, node: MessageNode):
        t_id = node.topic
        if t_id not in self.topic_observations:
            self.topic_observations[t_id] = {"summary": "", "key_entities": []}

        if node.wbos.get("W"):
            self.topic_observations[t_id]["key_entities"].append(
                node.wbos["W"])

        self.topic_observations[t_id]["last_update"] = time.time()

    def evict_oldest_topic_node(self, topic: str):
        oldest_id = self.topic_index[topic].pop(0)
        oldest_node = self.nodes.get(oldest_id)

        if oldest_node:
            print(f"--- [Evicting] Topic: {topic} | Node: {oldest_id} ---")

            if self.storage_callback:
                self.storage_callback(oldest_node)

            del self.nodes[oldest_id]
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize graph to dict for Redis storage"""
        return {
            "nodes": {nid: node.to_dict() for nid, node in self.nodes.items()},
            "topic_index": dict(self.topic_index),
            "topic_observations": self.topic_observations,
            "topic_limit": self.topic_limit
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BaseGraphMemory':
        """Deserialize graph from dict"""
        graph = cls(topic_limit=data.get("topic_limit", 10))
        graph.nodes = {nid: MessageNode.from_dict(node_data) 
                      for nid, node_data in data.get("nodes", {}).items()}
        graph.topic_index = defaultdict(list, data.get("topic_index", {}))
        graph.topic_observations = data.get("topic_observations", {})
        return graph

    def _get_last_node_id(self) -> Optional[str]:
        if not self.nodes:
            return None
        return list(self.nodes.keys())[-1]

    def get_topic_context(self, topic: str) -> List[MessageNode]:
        return [self.nodes[nid] for nid in self.topic_index[topic] if nid in self.nodes]

    def get_recent_nodes_raw(self, limit: int = 10) -> List[MessageNode]:
        if not self.nodes:
            return []

        # Sắp xếp các node hiện có trong RAM theo thời gian giảm dần
        sorted_nodes = sorted(
            self.nodes.values(), 
            key=lambda x: x.timestamp, 
            reverse=True
        )

        # Trả về tối đa 'limit' node (lấy từ mới nhất đến cũ nhất)
        return sorted_nodes[:limit] 