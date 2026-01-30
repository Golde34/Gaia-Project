import time

from core.domain.enums.enum import SenderTypeEnum
from kernel.config import config
from core.domain.request.query_request import QueryRequest
from .redis_graph_storage import RedisMemoryOrchestrator
from .base_graph import BaseGraphMemory, MessageNode
from typing import Optional, Dict, Any


class GraphMemory:
    """
    Main class xử lý memory retrieval qua 4 giai đoạn:
    1. RAM Layer (quick_think)
    2. STAG Layer (recall_short_term)
    3. Global Memory Layer (recall_long_term)
    4. Consolidate & Response
    """
    
    def __init__(self, query: QueryRequest):
        self.query = query
        self.storage = RedisMemoryOrchestrator(session_id=query.dialogue_id)

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
        # 1. Khởi tạo Orchestrator & Pull Graph từ Redis (RAM)
        graph: BaseGraphMemory = self.storage.get_graph()
        
        # Lấy nhanh 10-20 nodes thô làm ngữ cảnh cho LLM
        fast_access_memory = graph.get_recent_nodes_raw(limit=config.RECENT_HISTORY_MAX_LENGTH)

        # 2. LLM Parse Command & WBOS (World, Behavior, Opinion, Observation)
        # Giả sử llm_response trả về cấu trúc như yêu cầu của bạn
        # llm_output = self.llm_service.parse_wbos(query=self.query.query, context=fast_access_memory)
        llm_output = {
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

        # 3. Xử lý Tool Fuzzy Matching (Levenshtein)
        # extracted_tool = llm_output.get("tool")
        # if not extracted_tool or extracted_tool == "null":
        #     # Logic: Lấy danh sách tool từ Config hoặc VectorDB và so sánh
        #     # available_tools = self.get_registered_tools() 
        #     available_tools = ["create_task", "register_schedule", "search_information"]
        #     final_tool = min(available_tools, key=lambda x: distance(extracted_tool or "", x))
        # else:
        #     final_tool = extracted_tool

        # 4. Short-circuit Logic
        if llm_output.get("is_ready"):
            # Tạo MessageNode thực tế từ LLM Output
            new_node = MessageNode(
                node_id=f"node_{int(time.time()*1000)}",
                topic_id=llm_output.get("topic_id", "general"),
                content=self.query.query,
                wbos=llm_output.get("wbos"),
                confidence=llm_output.get("confidence", 0.0),
                role=SenderTypeEnum.USER,
                # tool=final_tool
            )

            # 5. Thực thi Logic trong BaseMemoryGraph (Logic Object)
            # Trong lock để đảm bảo atomicity cho việc Evict & Summarize
            with self.storage.lock:
                # add_node sẽ tự động thực hiện:
                # - Stitching topic_link_id
                # - Tăng topic_counter
                # - IF counter > limit: recursive_summarize() -> evict_oldest_node()
                graph.add_node(new_node)
                
                # 6. Push Graph ngược lại Redis
                self.storage.save_graph(graph)

            return {
                "fast_access_memory": [n.to_dict() for n in fast_access_memory],
                "memory_node": new_node.to_dict(),
                "response": llm_output.get("response"),
                "is_ready": True
            }

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
