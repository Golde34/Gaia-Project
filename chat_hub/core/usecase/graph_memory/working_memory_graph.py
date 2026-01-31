import json

from core.domain.response.graph_llm_response import SlmExtractionResponse
from core.domain.request.query_request import QueryRequest
from infrastructure.redis.redis import rd
from infrastructure.redis.lua_script import lua_scripts


class WorkingMemoryGraph:
    def __init__(self, query: QueryRequest):
        self.r = rd
        self.query = query.query
        self.session_id = query.dialogue_id

        self.nodes_key = f"graph:{self.session_id}:nodes"
        self.metadata_key = f"graph:{self.session_id}:metadata"
        self.topics_prefix = f"graph:{self.session_id}:topics"

    def fetch_recent_nodes(self) -> tuple[dict, dict, dict]:
        raw_meta = self.r.hgetall(self.metadata_key)

        t_ids = [k.split(":")[1]
                 for k in raw_meta
                 if k.startswith("topic:")
                 and k.endswith(":count")]

        pipe = self.r.pipeline()
        pipe.hgetall(self.nodes_key)
        for t_id in t_ids:
            pipe.lindex(f"{self.topics_prefix}:{t_id}", 0)

        results = pipe.execute()

        processed_nodes = {
            k: json.loads(v) for k, v in results[0].items()}

        last_topic_nodes = {t_id: results[i+1] for i, t_id in enumerate(t_ids)}

        processed_meta = {}
        for k, v in raw_meta.items():
            try:
                processed_meta[k] = json.loads(v)
            except (json.JSONDecodeError, TypeError):
                processed_meta[k] = v

        return processed_nodes, processed_meta, last_topic_nodes

    def build_graph(self, new_node: SlmExtractionResponse, last_topic_nodes: dict) -> dict:
        max_id = 0
        if last_topic_nodes:
            for last_id in last_topic_nodes.values():
                try:
                    val = int(last_id.split("_")
                              [-1]) if "_" in str(last_id) else int(last_id)
                    max_id = max(max_id, val)
                except:
                    continue
        node_id = str(max_id + 1)

        topic = new_node.topic
        specific_topic_key = f"{self.topics_prefix}:{topic}"

        node_json = json.dumps(new_node.model_dump())

        evicted_node_json = lua_scripts.build_graph_memory(
            keys=[self.nodes_key, specific_topic_key, self.metadata_key],
            args=[node_id, node_json, topic, 10]
        )

        if evicted_node_json:
            return json.loads(evicted_node_json)
        return None
