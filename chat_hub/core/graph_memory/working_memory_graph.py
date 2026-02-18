import json
from typing import Any, Dict, Tuple
import uuid

from core.domain.enums.enum import MemoryModel
from core.domain.enums.graph_memory_enum import GraphRoutingDecision
from core.prompts import graph_prompts
from core.domain.response.graph_llm_response import SlmExtractionResponse
from core.domain.request.query_request import LLMModel, QueryRequest
from infrastructure.redis.redis import rd
from infrastructure.redis.lua_script import lua_scripts
from kernel.config import llm_models


class WorkingMemoryGraph:
    def __init__(self, query: QueryRequest):
        self.r = rd
        self.query = query
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

    async def quick_think(
        self,
        raw_nodes: dict,
        metadata: dict,
        last_topic_nodes: dict
    ) -> Tuple[int, SlmExtractionResponse]:
        print("Raw Nodes from RAM:", raw_nodes)
        print("Metadata from RAM:", metadata)
        history_str, observation_str = self._extract_recent_nodes(
            raw_nodes, metadata
        )

        print("---- Quick Think Prompt ----")
        print("History Context:\n", history_str)
        print("Observations:\n", observation_str)

        extract_info_prompt = graph_prompts.WORKING_MEMORY_EXTRACTOR_PROMPT.format(
            query=self.query.query,
            history=history_str,
            observations=observation_str
        )

        model: LLMModel = llm_models.build_slm_model(
            memory_model=MemoryModel.GRAPH
        )

        function = await llm_models.get_model_generate_content(
            model=model,
            user_id=self.query.user_id,
            prompt=extract_info_prompt
        )
        slm_output = function(
            prompt=extract_info_prompt,
            model=model,
            dto=SlmExtractionResponse
        )
        print("SLM Output:", slm_output)
        response = SlmExtractionResponse.model_validate(
            json.loads(slm_output))
        response.user_query = self.query.query

        if response.routing_decision == GraphRoutingDecision.LLM.value:
            response.response = await self.quick_answer(raw_nodes, metadata)

        node_id: int = self._get_max_id(last_topic_nodes)
        return node_id, response

    def _extract_recent_nodes(self, raw_nodes: dict, metadata: dict) -> str:
        history_str = ""
        for _, node in raw_nodes.items():
            user_query = node.get('user_query', '')
            bot_response = node.get('content', node.get('response', ''))
            topic = node.get('topic', 'general')

            history_str += f"[User]: {user_query} (Topic: {topic})\n"
            history_str += f"[Bot]: {bot_response} (Topic: {topic})\n"

        observation_str = ""
        for key, value in metadata.items():
            if ":S" in key or ":O" in key or ":W" in key:
                observation_str += f"- {key}: {value}\n"
        return history_str, observation_str

    def _get_max_id(self, last_topic_nodes: dict) -> int:
        max_id = 0
        if last_topic_nodes:
            for last_id in last_topic_nodes.values():
                try:
                    val = int(last_id.split("_")
                              [-1]) if "_" in str(last_id) else int(last_id)
                    max_id = max(max_id, val)
                except:
                    continue
        return max_id + 1

    def build_graph(self, node_id: int, new_node: SlmExtractionResponse) -> None:
        topic = new_node.topic
        specific_topic_key = f"{self.topics_prefix}:{topic}"

        node_json = json.dumps(new_node.model_dump())

        evicted_node_json = lua_scripts.build_graph_memory(
            keys=[self.nodes_key, specific_topic_key, self.metadata_key],
            args=[str(node_id), node_json, topic, 10]
        )
        print("Evicted Node JSON:", evicted_node_json)

    async def quick_answer(self, raw_nodes: dict, metadata: dict) -> str:
        print("Raw Nodes from RAM:", raw_nodes)
        print("Metadata from RAM:", metadata)
        history_str, observation_str = self._extract_recent_nodes(
            raw_nodes, metadata
        )

        print("---- Quick Think Prompt ----")
        print("History Context:\n", history_str)
        print("Observations:\n", observation_str)

        quick_answer_prompt = graph_prompts.QUICK_ANSWER_PROMPT.format(
            query=self.query.query,
            recent_nodes=history_str,
            metadata=observation_str
        )

        model: LLMModel = llm_models.build_system_model(
            memory_model=MemoryModel.GRAPH
        )

        function = await llm_models.get_model_generate_content(
            model=model,
            user_id=self.query.user_id,
            prompt=quick_answer_prompt
        )
        return function(prompt=quick_answer_prompt, model=model)
