import asyncio
from kernel.config import llm_models
from core.usecase.graph_memory.working_memory_graph import WorkingMemoryGraph
from core.domain.enums.enum import GraphModelEnum, SenderTypeEnum
from core.domain.request.query_request import QueryRequest
from .base_graph import MessageNode
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
        self.working_memory_graph = WorkingMemoryGraph(self.query)

    async def quick_think(self) -> str:
        raw_nodes, metadata = self.working_memory_graph.fetch_recent_nodes()

        prompt = f"later {raw_nodes} with metadata {metadata}"
        llm_function = await llm_models.get_model_generate_content(
            model=self.query.model,
            user_id=self.query.user_id,
            prompt=prompt
        )
        ai_decision = await llm_function(prompt, self.query.model)

        # Fuzzy Matching Tool Logic (Levenshtein) --- IGNORE ---
        # Build new node
        new_node = MessageNode.from_dict(ai_decision['new_node'])

        evicted_node_json = self.working_memory_graph.build_graph(
            new_node_data=new_node,
            topic_id=ai_decision['topic_id'],
            limit=10
        )

        if ai_decision["is_ready"]:
            asyncio.create_task(self.process_to_stag(evicted_node_json))
            return ai_decision["response"] # Trả kết quả ngay (RAM HIT)
        
        self.process_to_tag(evicted_node_json)
        return None

    def process_to_tag(self, evicted_node_json: Optional[str]):
        """
        Xử lý đẩy node bị evict xuống STAG (Neo4J)
        """
        if evicted_node_json:
            evicted_node = MessageNode.from_dict(evicted_node_json)
        pass
        
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
