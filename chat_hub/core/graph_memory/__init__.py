from typing import Dict, Any, Optional

from core.domain.request.query_request import QueryRequest
from core.graph_memory.short_term_activation_graph import ShortTermActivationGraph
from core.graph_memory.working_memory_graph import WorkingMemoryGraph


class GraphMemory:
    """
    1. RAM Layer (quick_think)
    2. STAG Layer (recall_short_term)
    3. Global Memory Layer (recall_long_term)
    4. Consolidate & Response
    """

    def __init__(self, query: QueryRequest):
        self.query = query
        self.wmg = WorkingMemoryGraph(self.query)
        self.stag = ShortTermActivationGraph(self.query)

    def execute_reasoning(self, engine: str):
        """
        Giai đoạn 1: RAM Layer - Suy nghĩ nhanh trong Working Memory Graph
        - Lấy các node gần đây từ WMG
        - Tóm tắt & trích xuất thông tin liên quan từ các node này
        - Kiểm tra quyết định định tuyến (SLM, STAG, LLM)

        Returns:
            Dict[str, Any]: Kết quả suy nghĩ nhanh nếu có, ngược lại None
        """
        raw_nodes, metadata, _ = self.wmg.fetch_recent_nodes()
        return self.wmg.quick_answer(raw_nodes, metadata) # Later replace by stag

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
        ram_result = self.execute_reasoning()
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
