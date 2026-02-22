import asyncio
import json
import time
from typing import List
import uuid

import numpy as np

from core.domain.enums.enum import MemoryModel
from core.domain.request.query_request import LLMModel, QueryRequest
from core.domain.response.graph_llm_response import SlmExtractionResponse
from core.graph_memory.dto.signal import Signal
from core.graph_memory.entity.stag import stag_entity
from core.graph_memory.working_memory_graph import WorkingMemoryGraph
from core.prompts import graph_prompts
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.redis.redis import rd
from infrastructure.redis.lua_script import lua_scripts
from kernel.config import llm_models


CONTENT_TEMPLATE = """Topic: {topic} | Content: {content}"""  # Template for consistent content formatting in STAG


class ShortTermActivationGraph:
    def __init__(self, query: QueryRequest):
        self.query = query
        self.wmg = WorkingMemoryGraph(query)
        self.r = rd

        self.stag_energy_prefix = f"stag:energy:{self.query.dialogue_id}:"
        self.stag_metadata_key = f"stag:metadata:{self.query.dialogue_id}"
        self.prefix = f"stag:{self.query.dialogue_id}"
        self.content_vector = f""

    async def on_new_message(self, metadata: SlmExtractionResponse):
        signal: Signal = await self.preprocess_signal(self.query.query, metadata)

        active_subgraph = await self.activate_context(signal, metadata)
        print(f"Active Subgraph Nodes: {active_subgraph}")

        prompt = graph_prompts.ANALYZING_ANSWER_PROMPT.format(
            query=self.query.query,
            active_subgraph=json.dumps(active_subgraph),
        )
        model: LLMModel = llm_models.build_system_model(
            memory_model=MemoryModel.GRAPH
        )

        function = await llm_models.get_model_generate_content(
            model=model,
            user_id=self.query.user_id,
            prompt=prompt
        )
        return function(prompt=prompt, model=model)

    async def preprocess_signal(self, user_query: str, extracted_info: SlmExtractionResponse):
        content = CONTENT_TEMPLATE.format(
            topic=extracted_info.topic, content=user_query)
        raw_vector_list = await embedding_model.get_embeddings(texts=[content])
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

    def _extract_wbos_bitmask(self, extracted_info: SlmExtractionResponse, current_type=None):
        mapping = {'W': 8, 'B': 4, 'O': 2, 'S': 1}

        if current_type in mapping:
            return mapping[current_type]

        wbos = extracted_info.wbos
        mask = sum(val for key, val in mapping.items()
                   if getattr(wbos, key, False))

        # Default to S (1) if SLM extracts nothing
        return mask or 1

    async def activate_context(self, signal: Signal, metadata: SlmExtractionResponse):
        topic = metadata.topic

        structural_nodes = self._flash_activation(topic)
        print(f"Phase 1 - Structural Nodes Activated: {structural_nodes}")

        activated_nodes = await self._neural_resonance(
            query_vector=signal.vector,
            structural_nodes=structural_nodes
        )
        print(
            f"Phase 2 - Resonance Result (Total Unique Nodes): {activated_nodes}")

        context_cloud = await self._wbos_pathing(
            m_new_wbos_mask=signal.bitmask,
            activated_nodes=activated_nodes
        )
        print(
            f"Phase 3 - WBOS Pathing Complete. Context Cloud Size: {context_cloud}")

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
            e = float(self.r.hget(self.stag_energy_prefix, node_id) or 0)
            new_e = e + 0.2 * (1 - e)
            new_e = min(1.0, new_e)
            pipe.hset(self.stag_energy_prefix, node_id, new_e)
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

    async def _neural_resonance(
            self,
            query_vector: List[float],
            structural_nodes: List[dict]):

        alpha = 0.5  # Activation
        wmg_nodes_key = self.wmg.nodes_key

        search_output = stag_entity.search_top_n(
            user_id=str(self.query.user_id),
            query_embeddings=[query_vector],
            top_k=20
        )
        print("Search Output from STAG:", search_output)
        if not search_output or not search_output[0]:
            return structural_nodes

        semantic_results = search_output[0]
        node_hits = {}
        node_metadata = {}

        for hit in semantic_results:
            entity = hit.get('entity', {})
            nid = entity.get('node_id') or hit.get('id')
            score = hit.get('distance', 0)
            node_hits[nid] = max(node_hits.get(nid, 0), score)
            node_metadata[nid] = entity

        unique_node_ids = list(node_hits.keys())
        pipe = self.r.pipeline()
        for nid in unique_node_ids:
            pipe.hget(self.stag_energy_prefix, nid)
            pipe.hget(wmg_nodes_key, nid)
        redis_data = pipe.execute()

        # ACTIVATION & RE-HYDRATION
        resonance_nodes = []
        update_pipe = self.r.pipeline()
        for i, nid in enumerate(unique_node_ids):
            sim_score = node_hits[nid]
            # current_e is already (Old_E * 0.8) thanks to the Lua script above
            current_e = float(redis_data[i*2] or 0)
            raw_wmg_json = redis_data[i*2 + 1]

            # Resonance Formula: E(t+1) = (E_old * gamma) + (sim * alpha)
            new_energy = min(1.0, current_e + (sim_score * alpha))

            if raw_wmg_json:
                node_data = json.loads(raw_wmg_json)
                node_data["node_id"] = nid
                node_data["e"] = new_energy
                resonance_nodes.append(node_data)
                update_pipe.hset(self.stag_energy_prefix, nid, new_energy)
            elif sim_score > 0.85:
                ltm_entity = node_metadata.get(nid)
                if ltm_entity:
                    ltm_entity["node_id"] = nid
                    ltm_entity["e"] = 0.8  # Re-hydration boost
                    resonance_nodes.append(ltm_entity)
                    update_pipe.hset(wmg_nodes_key, nid,
                                     json.dumps(ltm_entity))
                    update_pipe.hset(self.stag_energy_prefix, nid, 0.8)

        update_pipe.execute()

        all_nodes_dict = {str(n['node_id']): n for n in structural_nodes}
        for r_node in resonance_nodes:
            nid = str(r_node['node_id'])
            if nid in all_nodes_dict:
                all_nodes_dict[nid]['e'] = max(
                    all_nodes_dict[nid]['e'], r_node['e'])
            else:
                all_nodes_dict[nid] = r_node

        return list(all_nodes_dict.values())

    async def _wbos_pathing(self, m_new_wbos_mask: int, activated_nodes: List[dict]):
        """
        Phase 3: Logical Pulse Propagation.
        Goal: High-speed local expansion via structural edges.
        """
        # 1. Define Logic Gates (S:1, O:2, B:4, W:8)
        # If Input is S (1), look for O (2). If Input is W (8), look for B (4).
        logic_gates = {1: 2, 2: 4, 8: 4, 4: 1}
        target_bit = logic_gates.get(m_new_wbos_mask)

        if not target_bit or not activated_nodes:
            return activated_nodes

        # 2. Collect all potential neighbor IDs from the 'ed' field of activated nodes
        # Limit to Top 5 most energetic nodes to prevent explosion
        source_nodes = sorted(
            activated_nodes, key=lambda x: x.get('e', 0), reverse=True)[:5]

        neighbor_ids = set()
        for node in source_nodes:
            edges = node.get('ed', {})
            if isinstance(edges, str):
                edges = json.loads(edges)

            # Pull Prev, Next, and Last Topic neighbors
            for nid in [edges.get('p'), edges.get('n'), edges.get('lt')]:
                if nid:
                    neighbor_ids.add(str(nid))

        if not neighbor_ids:
            return activated_nodes

        # 3. Batch fetch neighbors from Redis (Fast O(1) lookups)
        pipe = self.r.pipeline()
        for nid in neighbor_ids:
            pipe.hgetall(f"stag:node:{nid}")
            pipe.hget(self.stag_energy_prefix, nid)

        raw_results = pipe.execute()

        # 4. Filter and Boost Energy
        hindsight_nodes = []
        omega_wbos = 0.3  # Logical boost weight

        for i, nid in enumerate(neighbor_ids):
            node_data = raw_results[i*2]
            current_energy = float(raw_results[i*2 + 1] or 0)

            if not node_data:
                continue

            # Check if neighbor matches the logic gate bitmask
            neighbor_w = int(node_data.get('w', 0))
            if neighbor_w & target_bit:
                # Boost the energy and record the jump
                new_e = min(1.0, current_energy + omega_wbos)
                node_data['node_id'] = nid
                node_data['e'] = new_e
                hindsight_nodes.append(node_data)

                # Update boosted energy back to Redis for future resonance
                self.r.hset(self.stag_energy_prefix, nid, new_e)

        # 5. Final Merge
        all_nodes_dict = {str(n['node_id']): n for n in activated_nodes}
        for h_node in hindsight_nodes:
            nid = str(h_node['node_id'])
            if nid in all_nodes_dict:
                all_nodes_dict[nid]['e'] = max(
                    all_nodes_dict[nid]['e'], h_node['e'])
            else:
                all_nodes_dict[nid] = h_node

        return list(all_nodes_dict.values())

    async def commit_to_memory(self, current_node_id: int, extracted_info: SlmExtractionResponse):
        """
        Store energy value in Redis for quick access during activation.
        Store detailed node information in VectorDB for semantic search.
        """
        self.r.hset(self.stag_energy_prefix, current_node_id, 1.0)

        asyncio.create_task(self._store_stag_vector(
            current_node_id, extracted_info))

        asyncio.create_task(self._trigger_graph_maintenance(
            current_node_id, extracted_info))

    async def _store_stag_vector(self, node_id: int, extracted_info: SlmExtractionResponse):
        wbos_data = extracted_info.wbos

        for wbos_type, content_value in wbos_data.model_dump().items():
            if content_value:
                content = CONTENT_TEMPLATE.format(
                    topic=extracted_info.topic,
                    content=content_value
                )
                embeddings = await embedding_model.get_embeddings(
                    texts=[content]
                )
                vector = embeddings[0]
                stag_entity.insert_data(
                    user_id=str(self.query.user_id),
                    node_id=str(node_id),
                    topic=extracted_info.topic,
                    wbos_mask=self._extract_wbos_bitmask(
                        extracted_info, current_type=wbos_type),
                    wbos_type=wbos_type,        # "W", "B", "O", or "S"
                    vector=vector,
                    content=content,
                    timestamp=int(time.time())
                )

    async def _trigger_graph_maintenance(self, current_node_id: int, extracted_info: SlmExtractionResponse):
        gamma = 0.8  # Decay
        lua_scripts.decay_stag_nodes(
            keys=[self.stag_energy_prefix],
            args=[gamma]
        )
        stag_meta_result = lua_scripts.update_stag_metadata(
            keys=[self.stag_metadata_key, f"{self.prefix}:topics_recency"],
            args=[str(current_node_id), extracted_info.topic,
                  50, int(time.time())]
        )
        print("STAG Metadata Updated:", stag_meta_result)
