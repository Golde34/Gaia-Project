import json

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

    def fetch_recent_nodes(self) -> tuple[dict, dict]:
        pipe = self.r.pipeline()
        pipe.hgetall(self.nodes_key)
        pipe.hgetall(self.metadata_key)

        raw_nodes, raw_metadata = pipe.execute()

        processed_nodes = {k: json.loads(v) for k, v in raw_nodes.items()}

        processed_metadata = {}
        for k, v in raw_metadata.items():
            try:
                processed_metadata[k] = json.loads(v)
            except:
                processed_metadata[k] = v

        return processed_nodes, processed_metadata

    def build_graph(self, new_node: dict):
        """
        Add newest node and evict oldest node if over limit.
        Logic 3 pieces: Nodes (Hash), Topics (List), Metadata (Hash - containing S, W, B, O, count)
        """
        node_id = new_node.get("node_id")
        topic_id = new_node.get("topic_id", "general")

        specific_topic_key = f"{self.topics_prefix}:{topic_id}"

        # Execute Lua Script
        # KEYS: [nodes_key, specific_topic_key, metadata_key]
        # ARGV: [node_id, node_json, topic_id, topic_limit]
        evicted_node_json = lua_scripts.build_graph_memory(
            keys=[self.nodes_key, specific_topic_key, self.metadata_key],
            args=[node_id, json.dumps(new_node), topic_id, 10]
        )

        if evicted_node_json:
            return json.loads(evicted_node_json)

        return None
