import json
import uuid

import numpy as np

from infrastructure.vector_db.milvus import milvus_db
from core.domain.response.graph_llm_response import SlmExtractionResponse
from core.graph_memory.dto.signal import Signal
from core.graph_memory.working_memory_graph import WorkingMemoryGraph
from core.domain.request.query_request import QueryRequest
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.redis.redis import rd


class ShortTermActivationGraph:
    def __init__(self, query: QueryRequest):
        self.query = query
        self.wmg = WorkingMemoryGraph(query)
        self.r = rd

    def on_new_message(self, metadata: SlmExtractionResponse):
        """
        Main Entry Point: Phối hợp giữa Ghi nhớ và Tư duy.
        """
        signal: Signal = self.preprocess_signal(self.query.query, metadata)

        # PHẦN 1: ACTIVATE CONTEXT (Thinking / Recall)
        # Tìm kiếm các node liên quan trong Short-term Memory và kích hoạt chúng
        active_subgraph = self.activate_context(self.query, signal, metadata)

        # PHẦN 2: ENCODE MEMORY (Add New Message)
        # Lưu node mới và thiết lập các "Hard-wired Edges" ban đầu
        new_node = self.commit_to_memory(
            self.query.user_id, signal, metadata, active_subgraph)

        return {
            "status": "integrated",
            "active_nodes": active_subgraph,
            "new_node_id": new_node.id
        }

    def preprocess_signal(self, content, extracted_info: SlmExtractionResponse):
        raw_vector_list = embedding_model.get_embeddings(texts=[content])
        raw_vector = np.array(raw_vector_list[0])
        norm = np.linalg.norm(raw_vector)
        normalized_vector = raw_vector / norm if norm > 0 else raw_vector

        vector_id = str(uuid.uuid4())

        bitmask = self._extract_wbos_bitmask(extracted_info)

        return Signal(
            content=content,
            vector=normalized_vector.tolist(),
            bitmask=bitmask,
            vector_id=vector_id
        )

    def _extract_wbos_bitmask(self, extracted_info: SlmExtractionResponse):
        """
        Analyzing WBOS into bitmap (W:8, B:4, O:2, S:1).
        """
        mask = 0
        wbos = extracted_info.wbos
        if wbos.W:
            mask |= 8
        if wbos.B:
            mask |= 4
        if wbos.O:
            mask |= 2
        if wbos.S:
            mask |= 1

        # Default to S (1) if SLM extracts nothing
        return mask if mask > 0 else 1

    # ---------------------------------------------------------
    # PHẦN 1: ACTIVATE CONTEXT (The "Thinking" Process)
    # ---------------------------------------------------------

    def activate_context(self, query: QueryRequest, signal: Signal, metadata: SlmExtractionResponse):
        """
        Cơ chế 'Recall': Đánh thức các ký ức liên quan để chuẩn bị cho việc xử lý.
        """
        # 1. Flash Activation: Kích hoạt dựa trên cấu trúc (Temporal/Topic)
        # Trả về các node lân cận vật lý từ Redis
        structural_nodes = self._flash_activation(metadata.topic)
        print("Structural Activation Result:", structural_nodes)

        # 2. Neural Resonance: Kích hoạt dựa trên ý nghĩa (Vector Similarity)
        # Bao gồm cả logic Re-hydration từ Postgres nếu Similarity > 0.9
        semantic_nodes = self.phase_2_neural_resonance(signal.vector, metadata.topic)

        # 3. WBOS Propagation: Lan truyền năng lượng logic
        # Từ các node đã tìm thấy, "bắn" điện năng sang các node Opinion/Belief liên quan
        context_cloud = self.phase_3_wbos_pathing(
            structural_nodes + semantic_nodes, signal.bitmask)

        return context_cloud

    # ---------------------------------------------------------
    # PHẦN 2: ENCODE MEMORY (The "Storage" Process)
    # ---------------------------------------------------------

    def commit_to_memory(self, user_id, signal, metadata, active_subgraph):
        """
        Cơ chế 'Ghi nhớ': Lưu trữ node mới và thiết lập liên kết.
        """
        # 1. Xác định Last Topic Node hiện tại từ Redis
        # last_topic_id = redis_client.get(f"last_topic:{user_id}:{metadata['topic_id']}")
        last_topic_id = None  # Giả sử chưa có implement Redis

        # 2. Tạo Node Object với các cạnh (Edges) ban đầu
        node_data = {
            "t": metadata['topic_id'],
            "w": signal.bitmask,
            "e": 1.0,  # Node mới luôn có năng lượng tối đa
            "ed": {
                "p": metadata['prev_msg_id'],
                "lt": last_topic_id
            },
            "vid": signal.vector_id
        }

        # 3. Lưu đa tầng
        # - Redis: Hot access
        # - Milvus: Vector search
        # - PostgreSQL/ScyllaDB: Permanent Archive
        # save_to_hybrid_storage(node_data)

        # 4. Cập nhật con trỏ "Last Topic" trong Redis cho lần message sau
        # redis_client.set(f"last_topic:{user_id}:{metadata['topic_id']}", node_data.id)

        return node_data

    # ---------------------------------------------------------
    # CÁC HÀM CHI TIẾT (COMPONENTS)
    # ---------------------------------------------------------
    def _flash_activation(self, topic: str):
        wmg_meta = self.r.hgetall(self.wmg.metadata_key)
        if wmg_meta is None:
            return []

        last_node_id = wmg_meta.get("last_node_id")
        last_topic_node_id = wmg_meta.get(
            f"topic:{topic}:last_node_id") if f"topic:{topic}:last_node_id" in wmg_meta else None
        target_node_ids = list(
            set(filter(None, [last_node_id, last_topic_node_id])))
        if not target_node_ids:
            return []

        stag_energy_key = f"stag:energy:{self.query.dialogue_id}"
        wmg_nodes_key = self.wmg.nodes_key

        pipe = self.r.pipeline()
        for node_id in target_node_ids:
            pipe.hincrbyfloat(stag_energy_key, node_id, 0.2)  # Beta = 0.2 TODO: Magic number
            pipe.hget(wmg_nodes_key, node_id)

        results = pipe.execute()

        activated_nodes = []
        for i, node_id in enumerate(target_node_ids):
            energy_val = float(results[i*2])
            raw_json = results[i*2 + 1]

            if raw_json:
                node_data = json.loads(raw_json)
                node_data["node_id"] = node_id
                node_data["e"] = energy_val
                activated_nodes.append(node_data)
            else:
                activated_nodes.append({
                    "node_id": node_id,
                    "e": energy_val,
                    "status": "requires_hydration"
                })

        return activated_nodes

    def phase_2_neural_resonance(self, vector_new, topic_id):
        milvus_result = milvus_db.search_top_n()
        pass

    def phase_3_wbos_pathing(self, candidate_nodes, current_bitmask):
        """
        Điều hướng dòng điện dựa trên ma trận trọng số WBOS
        """
        # Duyệt qua các neighbor, check bitmask (S, O, B, W)
        # Apply ma trận trọng số: E_j = E_j + (E_i * omega_wbos)
        pass

    def save_new_node(self, user_id, content, vector, bitmask, topic_id):
        """
        Lưu dữ liệu đồng thời vào Redis (Hot), Milvus (Vector), Postgres (LTM)
        """
        pass

    # ---------------------------------------------------------
    # HỆ THỐNG BẢO TRÌ (BACKGROUND TASKS)
    # ---------------------------------------------------------

    def graph_maintenance_loop(self):
        """
        Chạy định kỳ (Cron job) để dọn dẹp Graph
        """
        # 1. Apply Global Energy Decay (E = E * delta)
        # 2. Identify pruning candidates (E < threshold)
        # 3. Perform Edge Repair (Temporal & Topic Chain Repair)
        # 4. Evict low energy nodes from Redis to Postgres
        pass
