from core.domain.request.query_request import QueryRequest
from .redis_graph_storage import RedisGraphStorage
from .base_memory_graph import MessageNode
from typing import Optional, Dict, Any


class GraphMemory:
    """
    Main class xử lý memory retrieval qua 4 giai đoạn:
    1. RAM Layer (quick_think)
    2. STAG Layer (recall_short_term)
    3. Global Memory Layer (recall_long_term)
    4. Consolidate & Response
    """
    
    def __init__(self, query: QueryRequest, redis_host='localhost', redis_port=6379):
        self.query = query
        self.storage = RedisGraphStorage(host=redis_host, port=redis_port)
    
    def quick_think(self) -> Optional[Dict[str, Any]]:
        """
        Giai đoạn 1: RAM Layer - Xử lý nhanh với 6-10 nodes gần nhất
        - Fetch recent messages from Redis RAM
        - Parse command & extract WBOS structure
        - Short-circuit if enough context
        
        Returns:
            Dict với kết quả nếu tìm thấy (RAM_HIT), None nếu cần chuyển sang STAG
        """
        query_text = self.query.query.lower()
        
        # Lấy 10 node gần nhất từ Redis
        recent_nodes = self.storage.get_recent_nodes(limit=10)
        
        # Phân tích nhanh query tìm thực thể/đại từ (Logic đơn giản)
        pronouns = ["nó", "hắn", "đó", "họ", "ấy", "kia", "này"]
        needs_context = any(pronoun in query_text for pronoun in pronouns)
        
        # Nếu không có đại từ, không cần short-circuit
        if not needs_context:
            return None  # Chuyển sang Giai đoạn 2 (STAG)
        
        # Quét ngược RAM tìm WBOS phù hợp
        for node in recent_nodes:
            wbos = node.wbos
            conf = node.confidence
            
            # Điều kiện Short-circuit: 
            # Có thực thể (W) hoặc Hành động (B) và độ tin cậy cao
            if (wbos.get('W') or wbos.get('B')) and conf > 0.8:
                target = wbos.get('W') or wbos.get('B')
                return {
                    "source": "RAM_HIT",
                    "resolved_entity": target,
                    "node_id": node.node_id,
                    "reasoning": f"Query '{self.query.query}' ám chỉ '{target}' từ node {node.node_id}",
                    "confidence": conf,
                    "original_content": node.content
                }
        
        # Không tìm thấy trong RAM
        return None
    
    def recall_short_term(self) -> Optional[Dict[str, Any]]:
        """
        Giai đoạn 2: STAG Layer - Truy vấn đồ thị ngắn hạn
        - Hybrid vector search on STAG
        - Find 1-3 centroid nodes
        - Graph expansion (1-hop)
        - Assemble context from subgraph
        
        TODO: Implement STAG vector search và graph expansion
        """
        stag_context = {
            "source": "STAG",
            "nodes": [],
            "reasoning": "STAG layer not implemented yet"
        }
        return None  # Chưa implement, chuyển sang layer tiếp theo
    
    def recall_long_term(self) -> Optional[Dict[str, Any]]:
        """
        Giai đoạn 3: Global Memory Layer - Leo thang bộ nhớ dài hạn
        - Escalation check (entity, timestamp, confidence)
        - Route to SLTG (semantic) or EMG (episodic)
        - Deep retrieval Top-K from long-term graphs
        
        TODO: Implement SLTG/EMG retrieval
        """
        ltm_context = {
            "source": "LTM",
            "sltg_results": [],
            "emg_results": [],
            "reasoning": "Long-term memory not implemented yet"
        }
        return None  # Chưa implement
    
    def consolidate_response(self) -> Dict[str, Any]:
        """
        Giai đoạn 4: Tổng hợp & Phản hồi
        - Structure prompt with priority: User > RAM > STAG > SLTG/EMG
        - Generate final response
        - Update memory (create new node, update edges, compress if needed)
        """
        # Thử từng layer theo thứ tự ưu tiên
        ram_result = self.quick_think()
        if ram_result:
            return ram_result
        
        stag_result = self.recall_short_term()
        if stag_result:
            return stag_result
        
        ltm_result = self.recall_long_term()
        if ltm_result:
            return ltm_result
        
        # Không tìm thấy context nào
        return {
            "source": "NO_CONTEXT",
            "reasoning": "No relevant context found in any memory layer",
            "query": self.query.query
        }