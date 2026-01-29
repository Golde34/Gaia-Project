from chat_hub.core.domain.enums.enum import SenderTypeEnum
from kernel.config import config
from core.domain.request.query_request import QueryRequest
from .redis_graph_storage import FastAccessMemory
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
        self.storage = FastAccessMemory(host=redis_host, port=redis_port)
    
    def quick_think(self) -> Optional[Dict[str, Any]]:
        """
        - Fetch recent messages from Redis RAM
        - Parse command & extract WBOS structure, response contains:
        + fast_access_memory: recent nodes from RAM
        + memory_node: extracted memory node with WBOS structure
        + response: generated response if enough context
        + is_ready: boolean flag is true if no need to go to STAG
        - Short-circuit if enough context
        
        """
        fast_access_memory = self.storage.get_recent_nodes(limit=config.RECENT_HISTORY_MAX_LENGTH*2) 
        # llm parse command and extract WBOS
        raw_response = {
            "fast_access_memory": [node.to_dict() for node in fast_access_memory],
            "memory_node": MessageNode(
                node_id="temp_node",
                content="Create for me a new task based on the recent messages.",
                wbos={
                    "W": "Task Management",
                    "B": "User needs to create a new task",
                    "O": "Important to track tasks efficiently",
                    "S": "No existing task found related to recent messages"
                },
                confidence=0.9,
                role=SenderTypeEnum.USER,
                tool="create_task"
            ),
            "response": "Sure, I have created a new task for you based on your recent messages.",
            "is_ready": True
        }
        # TODO: Trong trường hợp người dùng mới sử dụng 
        # và chưa load được các tool hay dùng, cần làm một function 
        # lấy ra tool nếu truyền null thì tự gen tool, so sánh với các 
        # tool hiện có trên vectorDB, chọn ra tool hợp lí nhất, dùng levenshtein
        if raw_response["is_ready"]:
            # Store message
            # Tạo node từ memory_node và commit vào Redis
            memory_node_dict = raw_response["memory_node"].to_dict()
            memory_node = MessageNode.from_dict(memory_node_dict)
            self.storage.commit_node(memory_node)
            return raw_response
        return None
        
    def recall_short_term(self) -> Optional[]:
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