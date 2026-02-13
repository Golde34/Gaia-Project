import uuid

import numpy as np
from torch import norm

from core.domain.response.graph_llm_response import SlmExtractionResponse
from core.graph_memory.dto.signal import Signal
from core.domain.request.query_request import QueryRequest
from infrastructure.embedding.base_embedding import embedding_model


class ShortTermActivationGraph:
    def __init__(self, query: QueryRequest):
        self.query = query

    def on_new_message(self, query: QueryRequest, metadata: SlmExtractionResponse):
        """
        Main Entry Point: Phối hợp giữa Ghi nhớ và Tư duy.
        """
        signal = self.preprocess_signal(query.query, metadata) 
        
        # PHẦN 1: ACTIVATE CONTEXT (Thinking / Recall)
        # Tìm kiếm các node liên quan trong Short-term Memory và kích hoạt chúng
        active_subgraph = self.activate_context(query.user_id, signal, metadata)
        
        # PHẦN 2: ENCODE MEMORY (Add New Message)
        # Lưu node mới và thiết lập các "Hard-wired Edges" ban đầu
        new_node = self.commit_to_memory(query.user_id, signal, metadata, active_subgraph)
        
        return {
            "status": "integrated",
            "active_nodes": active_subgraph,
            "new_node_id": new_node.id
        }
    
    def preprocess_signal(self, content, extracted_info: SlmExtractionResponse):
        """
        Biến đổi văn bản thô thành cấu trúc dữ liệu giàu đặc tính (Signal).
        """
        # 1. Tạo Vector Embedding (Phục vụ Phase 2: Neural Resonance)
        # Chúng ta normalize vector để dùng Cosine Similarity nhanh hơn
        raw_vector_list = embedding_model.get_embeddings(texts=[content])
        raw_vector = np.array(raw_vector_list[0]) 
        norm = np.linalg.norm(raw_vector)
        normalized_vector = raw_vector / norm if norm > 0 else raw_vector

        # 2. Định danh Vector (ID để liên kết giữa Redis, Milvus và Postgres)
        vector_id = str(uuid.uuid4())
        
        # 3. Phân tích WBOS Bitmask (Phục vụ Phase 3: Logical Routing)
        bitmask = self._extract_wbos_bitmask(extracted_info)
        
        return Signal(
            content=content,
            vector=normalized_vector.tolist(),
            bitmask=bitmask,
            vector_id=vector_id
        )

    def _extract_wbos_bitmask(self, extracted_info: SlmExtractionResponse):
        """
        Phân tích nội dung để gán nhãn WBOS (W:8, B:4, O:2, S:1).
        """
        mask = 0
        wbos = extracted_info.wbos
        if wbos.W: mask |= 8
        if wbos.B: mask |= 4
        if wbos.O: mask |= 2
        if wbos.S: mask |= 1
        
        # Mặc định là S (1) nếu SLM không trích xuất được gì
        return mask if mask > 0 else 1


    # ---------------------------------------------------------
    # PHẦN 1: ACTIVATE CONTEXT (The "Thinking" Process)
    # ---------------------------------------------------------

    def activate_context(self, user_id, signal, metadata):
        """
        Cơ chế 'Recall': Đánh thức các ký ức liên quan để chuẩn bị cho việc xử lý.
        """
        topic_id = metadata['topic_id']
        
        # 1. Flash Activation: Kích hoạt dựa trên cấu trúc (Temporal/Topic)
        # Trả về các node lân cận vật lý từ Redis
        structural_nodes = self.phase_1_flash_activation(user_id, topic_id)
        
        # 2. Neural Resonance: Kích hoạt dựa trên ý nghĩa (Vector Similarity)
        # Bao gồm cả logic Re-hydration từ Postgres nếu Similarity > 0.9
        semantic_nodes = self.phase_2_neural_resonance(signal.vector, topic_id)
        
        # 3. WBOS Propagation: Lan truyền năng lượng logic
        # Từ các node đã tìm thấy, "bắn" điện năng sang các node Opinion/Belief liên quan
        context_cloud = self.phase_3_wbos_pathing(structural_nodes + semantic_nodes, signal.bitmask)
        
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
            "e": 1.0, # Node mới luôn có năng lượng tối đa
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

    def phase_1_flash_activation(self, user_id, topic_id):
        """
        Truy vấn nhanh từ Redis để lấy các node Prev và Last Topic
        """
        # Lookup Redis Hash: user:{id}:last_nodes
        # Cập nhật Energy: E = E + beta
        pass

    def phase_2_neural_resonance(self, vector_new, topic_id):
        """
        Tìm kiếm vector trong Milvus và quản lý Re-hydration
        """
        # 1. Search Milvus (limit by Topic ID)
        # 2. IF similarity > 0.9 AND node not in Redis:
        #    rehydrate_from_postgres(node_id)
        # 3. Update Energy theo công thức Decay + Sim * Alpha
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
