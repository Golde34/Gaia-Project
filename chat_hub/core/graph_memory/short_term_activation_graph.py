import json
import uuid
import time
from typing import List

import numpy as np

from infrastructure.vector_db.milvus import milvus_db
from core.domain.response.graph_llm_response import SlmExtractionResponse
from core.graph_memory.dto.signal import Signal
from core.graph_memory.entity.stag import stag_entity
from core.graph_memory.working_memory_graph import WorkingMemoryGraph
from core.domain.request.query_request import QueryRequest
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.redis.redis import rd


class ShortTermActivationGraph:
    def __init__(self, query: QueryRequest):
        self.query = query
        self.wmg = WorkingMemoryGraph(query)
        self.r = rd

        self.stag_energy_prefix = f"stag:energy:{self.query.dialogue_id}:"

    def on_new_message(self, metadata: SlmExtractionResponse):
        """
        Main Entry Point: Phối hợp giữa Ghi nhớ và Tư duy.
        """
        signal: Signal = self.preprocess_signal(self.query.query, metadata)

        active_subgraph = self.activate_context(self.query, signal, metadata)

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

    def activate_context(self, query: QueryRequest, signal: Signal, metadata: SlmExtractionResponse):
        topic = metadata.topic

        structural_nodes = self._flash_activation(topic)
        print(f"Phase 1 - Structural Nodes Activated: {len(structural_nodes)}")

        activated_nodes = self._neural_resonance(
            query_vector=signal.vector,
            topic=topic,
            structural_nodes=structural_nodes
        )
        print(
            f"Phase 2 - Resonance Result (Total Unique Nodes): {len(activated_nodes)}")

        # 3. Phase 3: WBOS Pathing (Lan truyền logic theo Gate)
        # Nhiệm vụ: Từ các node đang "sáng" ở P1 & P2, kiểm tra signal.bitmask của M_new.
        # Nếu M_new là 'S', nó sẽ tự động kích hoạt các hàng xóm 'O' hoặc 'B' của các node này.
        # Đây là bước tạo ra "Hindsight Context" (Hồi tưởng ngữ cảnh logic).
        context_cloud = self.phase_3_wbos_pathing(
            m_new_wbos_mask=signal.bitmask,
            activated_nodes=activated_nodes
        )
        print(
            f"Phase 3 - WBOS Pathing Complete. Context Cloud Size: {len(context_cloud)}")

        # 4. Sắp xếp Context Cloud theo Energy (Độ ưu tiên truyền vào LLM)
        # Những node có năng lượng cao nhất (vừa giống nghĩa, vừa khớp logic) sẽ đứng đầu.
        context_cloud.sort(key=lambda x: x.get('e', 0), reverse=True)

        return context_cloud

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

        wmg_nodes_key = self.wmg.nodes_key

        pipe = self.r.pipeline()
        for node_id in target_node_ids:
            # Beta = 0.2 TODO: Magic number
            pipe.hincrbyfloat(self.stag_energy_prefix, node_id, 0.2)
            pipe.hget(wmg_nodes_key, node_id)

        results = pipe.execute()

        structural_nodes = []
        for i, node_id in enumerate(target_node_ids):
            energy_val = float(results[i*2])
            raw_json = results[i*2 + 1]

            if raw_json:
                node_data = json.loads(raw_json)
                node_data["node_id"] = node_id
                node_data["e"] = energy_val
                structural_nodes.append(node_data)
            else:
                structural_nodes.append({
                    "node_id": node_id,
                    "e": energy_val,
                    "status": "requires_hydration"
                })

        return structural_nodes

    def _neural_resonance(
            self,
            query_vector: List[float],
            topic: str,
            structural_nodes: List[dict]):

        semantic_results = stag_entity.search_top_n(
            query_vector=query_vector,
            uid=self.query.user_id,
            active_topics=[topic],
            top_k=20
        )

        gamma = 0.8  # Decay
        alpha = 0.5  # Activation

        wmg_nodes_key = self.wmg.nodes_key

        node_hits = {}
        for hit in semantic_results:
            nid = hit["node_id"]
            score = hit["distance"]
            # Lấy score cao nhất nếu node đó có nhiều mảnh resonance
            node_hits[nid] = max(node_hits.get(nid, 0), score)

        if not node_hits:
            return structural_nodes

        # 2. CHECK STATUS TRÊN REDIS (PIPELINE)
        unique_node_ids = list(node_hits.keys())
        pipe = self.r.pipeline()
        for nid in unique_node_ids:
            pipe.hget(f"{self.stag_energy_prefix}energy", nid)
            pipe.hget(wmg_nodes_key, nid)

        redis_data = pipe.execute()

        # 3. TÍNH TOÁN CỘNG HƯỞNG
        resonance_nodes = []
        update_pipe = self.r.pipeline()

        for i, nid in enumerate(unique_node_ids):
            sim_score = node_hits[nid]
            current_e = float(redis_data[i*2] or 0)
            raw_wmg_json = redis_data[i*2 + 1]

            # CÔNG THỨC KÍCH HOẠT
            new_energy = min(1.0, (current_e * gamma) + (sim_score * alpha))

            if raw_wmg_json:
                node_data = json.loads(raw_wmg_json)
                node_data["node_id"] = nid
                node_data["e"] = new_energy
                resonance_nodes.append(node_data)
            elif sim_score > 0.85:
                # RE-HYDRATION từ Cold Storage (Postgres)
                node_from_ltm = self.fetch_from_permanent_storage(nid)
                if node_from_ltm:
                    node_from_ltm["node_id"] = nid
                    node_from_ltm["e"] = 0.8  # Boost cho ký ức hồi sinh
                    resonance_nodes.append(node_from_ltm)
                    # Cache lại vào WMG (Hot layer)
                    update_pipe.hset(wmg_nodes_key, nid,
                                     json.dumps(node_from_ltm))

            # Cập nhật energy mới vào Redis
            update_pipe.hset(
                f"{self.stag_energy_prefix}energy", nid, new_energy)

        update_pipe.execute()

        # 4. MERGE (Không trùng lặp, lấy energy cao nhất)
        all_nodes_dict = {n['node_id']: n for n in structural_nodes}
        for r_node in resonance_nodes:
            nid = r_node['node_id']
            if nid in all_nodes_dict:
                # Nếu node đã có ở Phase 1, cập nhật energy mới (cao hơn)
                all_nodes_dict[nid]['e'] = max(
                    all_nodes_dict[nid]['e'], r_node['e'])
            else:
                all_nodes_dict[nid] = r_node

        return list(all_nodes_dict.values())

    def fetch_from_permanent_storage(self, node_id):
        pass

    # ---------------------------------------------------------
    # PHẦN 2: ENCODE MEMORY (The "Storage" Process)
    # ---------------------------------------------------------

    def commit_to_memory(self, current_node_id: int, extracted_info: SlmExtractionResponse):
        """
        Cơ chế 'Ghi nhớ': Lưu trữ node mới (Atomic WBOS) và thiết lập liên kết Graph.
        """
        topic = extracted_info.topic
        dialogue_id = self.query.dialogue_id

        # 1. TRUY XUẤT VÀ CẬP NHẬT CON TRỎ (METADATA) TRÊN REDIS
        wmg_meta_key = self.wmg.metadata_key
        topic_last_key = f"topic:{topic}:last_node_id"

        # Lấy last_node_id và last_topic_node_id cũ trước khi ghi đè
        pipe_meta = self.r.pipeline()
        pipe_meta.hget(wmg_meta_key, "last_node_id")
        pipe_meta.hget(wmg_meta_key, topic_last_key)
        meta_results = pipe_meta.execute()

        prev_node_id = meta_results[0]
        last_topic_node_id = meta_results[1]

        # 2. THIẾT KẾ CẤU TRÚC GRAPH NODE (STAG DATA)
        # Lưu các Edges (Cạnh) để phục vụ Phase 1 & 3 sau này
        node_data = {
            "node_id": current_node_id,
            "t": topic,
            "w_mask": signal.bitmask,
            "e": 1.0,  # Luôn khởi tạo mức năng lượng tối đa
            "ed": {
                "p": prev_node_id,       # Prev (Temporal Edge)
                "lt": last_topic_node_id  # Last Topic (Structural Edge)
            },
            "content": metadata.full_content,
            "ts": int(time.time())
        }

        # 3. LƯU TRỮ ĐA TẦNG (HYBRID STORAGE)

        # A. Tầng Hot (Redis): Lưu vào WMG Nodes để Phase 1 & 2 truy xuất O(1)
        wmg_nodes_key = self.wmg.nodes_key
        stag_energy_key = f"stag:energy:{dialogue_id}"

        pipe_storage = self.r.pipeline()
        pipe_storage.hset(wmg_nodes_key, current_node_id,
                          json.dumps(node_data))
        pipe_storage.hset(stag_energy_key, current_node_id, 1.0)

        # Cập nhật con trỏ Metadata cho tin nhắn kế tiếp
        pipe_storage.hset(wmg_meta_key, "last_node_id", current_node_id)
        pipe_storage.hset(wmg_meta_key, topic_last_key, current_node_id)
        pipe_storage.execute()

        # B. Tầng Subconscious (Milvus): Lưu Atomic WBOS (Hindsight)
        # Sử dụng class STAGEntity chúng ta đã thiết kế để xé nhỏ W, B, O, S
        stag_entity.insert_atomic_data(
            vid=current_node_id,
            uid=user_id,
            topic_name=topic,
            extracted_info=metadata,  # Chứa wbos.W, wbos.B...
            embedding_model=self.embedding_engine,
            milvus_db=milvus_db
        )

        # C. Tầng LTM (PostgreSQL): Lưu trữ vĩnh viễn (Cold Archive)
        # Phục vụ Re-hydration khi Redis bị xóa hoặc dữ liệu quá cũ
        self.archive_to_permanent_storage(node_data)

        print(
            f"--- [STAG Commit] Node {current_node_id} integrated into Memory. ---")

        return node_data

    # ---------------------------------------------------------
    # CÁC HÀM CHI TIẾT (COMPONENTS)
    # ---------------------------------------------------------

    def phase_3_wbos_pathing(self, m_new_wbos_mask: int, activated_nodes: List[dict]):
        """
        Input: 
            m_new_wbos_mask: Mask của tin nhắn hiện tại (ví dụ: 1 cho S)
            activated_nodes: Danh sách node từ Phase 1 & 2 (có kèm node_id, e, wbos_mask)
        """
        # 1. ĐỊNH NGHĨA CÁC CỔNG LOGIC (GATES)
        # Cấu trúc: { Nguồn_Bit: { Đích_Bit: Trọng_số_Omega } }
        LOGIC_GATES = {
            1: {2: 0.8, 4: 0.4},  # S -> O (0.8), S -> B (0.4)
            2: {4: 0.6, 8: 0.3},  # O -> B (0.6), O -> W (0.3)
            4: {8: 0.9, 1: 0.5},  # B -> W (0.9), B -> S (0.5)
            8: {1: 0.7, 4: 0.6}   # W -> S (0.7), W -> B (0.6)
        }

        stag_energy_key = f"stag:energy:{self.query.dialogue_id}"
        wmg_nodes_key = self.wmg.nodes_key

        # 2. XÁC ĐỊNH CÁC BIT ĐANG BẬT TRONG M_NEW
        active_input_bits = [bit for bit in [
            8, 4, 2, 1] if m_new_wbos_mask & bit]

        # 3. LAN TRUYỀN NĂNG LƯỢNG QUA CÁC CỔNG
        propagated_updates = {}  # {neighbor_node_id: additional_energy}
        nodes_to_fetch = set()

        for node in activated_nodes:
            source_e = node.get("e", 0)
            source_id = node.get("node_id")

            # Lấy danh sách neighbors của node này từ trường 'ed' (edges) trong Redis
            # (Giả sử node_data có trường 'edges' lưu {p: prev, n: next, lt: last_topic})
            edges = node.get("metadata", {}).get("edges", {})
            neighbor_ids = list(
                filter(None, [edges.get("p"), edges.get("n"), edges.get("lt")]))

            for input_bit in active_input_bits:
                if input_bit in LOGIC_GATES:
                    for target_bit, omega in LOGIC_GATES[input_bit].items():
                        # Tìm trong hàng xóm của node đang xét, node nào có target_bit thì boost
                        for n_id in neighbor_ids:
                            nodes_to_fetch.add(n_id)
                            # Logic: Năng lượng truyền đi = Năng lượng nguồn * Omega
                            boost = source_e * omega
                            propagated_updates[n_id] = propagated_updates.get(
                                n_id, 0) + boost

        if not nodes_to_fetch:
            return activated_nodes

        # 4. CẬP NHẬT REDIS VÀ LẤY DỮ LIỆU NEIGHBORS MỚI KÍCH HOẠT
        pipe = self.r.pipeline()
        neighbor_ids_list = list(nodes_to_fetch)
        for n_id in neighbor_ids_list:
            # Tăng năng lượng cho neighbor dựa trên bước nhảy logic
            if n_id in propagated_updates:
                pipe.hincrbyfloat(stag_energy_key, n_id,
                                  propagated_updates[n_id])
            pipe.hget(wmg_nodes_key, n_id)

        redis_results = pipe.execute()

        # 5. HỢP NHẤT VÀO DANH SÁCH ACTIVATED NODES
        final_nodes_dict = {n['node_id']: n for n in activated_nodes}

        for i, n_id in enumerate(neighbor_ids_list):
            # Kết quả pipeline: [hincrbyfloat_res, hget_res]
            new_e = float(redis_results[i*2] or 0)
            raw_json = redis_results[i*2 + 1]

            if raw_json:
                n_data = json.loads(raw_json)
                n_data["node_id"] = n_id
                n_data["e"] = min(1.0, new_e)  # Cap năng lượng tại 1.0

                # Hợp nhất: Nếu node đã có, cập nhật Energy, nếu chưa có thì thêm mới
                if n_id in final_nodes_dict:
                    final_nodes_dict[n_id]["e"] = max(
                        final_nodes_dict[n_id]["e"], n_data["e"])
                else:
                    final_nodes_dict[n_id] = n_data

        return list(final_nodes_dict.values())

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
