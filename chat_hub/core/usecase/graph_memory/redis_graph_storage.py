import redis
import json
import time
from typing import Optional, List, Dict, Any
from .base_memory_graph import MessageNode


class RedisGraphStorage:
    """
    CRUD operations cho Memory Graph sử dụng Redis
    Lưu trữ message nodes và WBOS properties vào Redis
    """
    
    def __init__(self, host='localhost', port=6379, db=0):
        """Kết nối vào RAM Server (Redis)"""
        self.r = redis.Redis(host=host, port=port, db=db, decode_responses=True)
        self.window_key = "bot:active_window"
        self.node_prefix = "node:"
    
    def commit_node(self, node: MessageNode) -> None:
        """
        CREATE/UPDATE: Lưu Node vào Redis
        
        Args:
            node: MessageNode cần lưu
        """
        node_key = f"{self.node_prefix}{node.node_id}"
        
        # 1. Lưu Node Data dưới dạng Hash
        self.r.hset(node_key, mapping={
            "content": node.content,
            "wbos": json.dumps(node.wbos),
            "confidence": str(node.confidence),
            "role": node.role,
            "timestamp": str(node.timestamp)
        })
        
        # 2. Cập nhật Active Window (Dùng List làm hàng chờ)
        self.r.lpush(self.window_key, node.node_id)
        
        # 3. Tự động Evict (Xóa node cũ nếu > 10 trong RAM)
        if self.r.llen(self.window_key) > 10:
            old_node_id = self.r.rpop(self.window_key)
            # TODO: Đẩy old_node_id này xuống STAG trước khi xóa
            self._delete_node(old_node_id)
    
    def commit_message(self, node_id: str, content: str, wbos: Dict[str, Any], 
                      confidence: float, role: str) -> MessageNode:
        """
        Helper method: Tạo và lưu message mới
        
        Args:
            node_id: ID của node
            content: Nội dung message
            wbos: WBOS properties dict
            confidence: Độ tin cậy (0-1)
            role: 'user' hoặc 'assistant'
            
        Returns:
            MessageNode đã được tạo
        """
        node = MessageNode(
            node_id=node_id,
            content=content,
            wbos=wbos,
            confidence=confidence,
            role=role
        )
        self.commit_node(node)
        return node
    
    def get_node(self, node_id: str) -> Optional[MessageNode]:
        """
        READ: Lấy Node từ Redis theo ID
        
        Args:
            node_id: ID của node cần lấy
            
        Returns:
            MessageNode hoặc None nếu không tìm thấy
        """
        node_key = f"{self.node_prefix}{node_id}"
        node_data = self.r.hgetall(node_key)
        
        if not node_data:
            return None
        
        return MessageNode(
            node_id=node_id,
            content=node_data.get('content', ''),
            wbos=json.loads(node_data.get('wbos', '{}')),
            confidence=float(node_data.get('confidence', 0)),
            role=node_data.get('role', 'user'),
            timestamp=float(node_data.get('timestamp', time.time()))
        )
    
    def get_recent_nodes(self, limit: int = 10) -> List[MessageNode]:
        """
        READ: Lấy các node gần nhất từ active window
        
        Args:
            limit: Số lượng nodes tối đa cần lấy
            
        Returns:
            List của MessageNode
        """
        node_ids = self.r.lrange(self.window_key, 0, limit - 1)
        nodes = []
        
        for node_id in node_ids:
            node = self.get_node(node_id)
            if node:
                nodes.append(node)
        
        return nodes
    
    def _delete_node(self, node_id: str) -> None:
        """
        DELETE: Xóa Node khỏi Redis
        
        Args:
            node_id: ID của node cần xóa
        """
        node_key = f"{self.node_prefix}{node_id}"
        self.r.delete(node_key)
    
    def update_node_confidence(self, node_id: str, new_confidence: float) -> bool:
        """
        UPDATE: Cập nhật độ tin cậy của node
        
        Args:
            node_id: ID của node
            new_confidence: Độ tin cậy mới (0-1)
            
        Returns:
            True nếu cập nhật thành công, False nếu không tìm thấy node
        """
        node_key = f"{self.node_prefix}{node_id}"
        if self.r.exists(node_key):
            self.r.hset(node_key, "confidence", str(new_confidence))
            return True
        return False
    
    def clear_active_window(self) -> None:
        """Xóa toàn bộ active window (dùng cho testing)"""
        node_ids = self.r.lrange(self.window_key, 0, -1)
        for node_id in node_ids:
            self._delete_node(node_id)
        self.r.delete(self.window_key)
