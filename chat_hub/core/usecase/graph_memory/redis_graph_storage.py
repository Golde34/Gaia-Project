import json

from core.usecase.graph_memory.base_graph import BaseGraphMemory, MessageNode
from infrastructure.redis.redis import rd

class RedisMemoryOrchestrator:
    def __init__(self, session_id: str):
        self.r = rd
        self.session_key = f"graph_memory:{session_id}"
        self.lock_key = f"lock:graph_memory:{session_id}"
        self.lock = self.r.lock(self.lock_key, timeout=5)

    def get_graph(self) -> BaseGraphMemory:
        """Lấy toàn bộ trạng thái Graph từ Redis"""
        raw_data = self.r.get(self.session_key)
        if raw_data:
            data_dict = json.loads(raw_data)
            return BaseGraphMemory.from_dict(data_dict)
        return BaseGraphMemory()

    def save_graph(self, graph: BaseGraphMemory):
        json_data = json.dumps(graph.to_dict())
        self.r.set(self.session_key, json_data)

    def sync_process(self, new_node: MessageNode):
        """
        Quy trình Core: Pull -> Logic -> Push
        """
        # 1. Acquire Lock (Để tránh xung đột khi có nhiều tin nhắn tới cùng lúc)
        with self.r.lock(self.lock_key, timeout=5):
            # 2. Pull
            graph = self.get_graph()
            
            # 3. Logic (Thực thi các hàm bạn đã viết trong BaseMemoryGraph)
            # add_node sẽ tự động kích hoạt:
            # - Topic Stitching
            # - Topic Counter check
            # - Recursive Summarize (nếu đạt ngưỡng)
            # - Evict oldest node (nếu đạt ngưỡng)
            graph.add_node(new_node)
            
            # 4. Push
            self.save_graph(graph)
            
        return graph
