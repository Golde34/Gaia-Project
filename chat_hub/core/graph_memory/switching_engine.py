import asyncio
from platform import node
from core.domain.enums.graph_memory_enum import GraphRoutingDecision
from core.domain.request.query_request import QueryRequest
from core.domain.response.graph_llm_response import SlmExtractionResponse
from core.graph_memory.short_term_activation_graph import ShortTermActivationGraph
from core.graph_memory.working_memory_graph import WorkingMemoryGraph


class SwitchingEngine:
    def __init__(self, query: QueryRequest):
        self.query = query
        self.wmg = WorkingMemoryGraph(self.query)
        self.stag = ShortTermActivationGraph(self.query)
        
    async def choose_engine(self):
        raw_nodes, metadata, last_topic_nodes = self.wmg.fetch_recent_nodes()
        working_memory_response = await self.wmg.quick_think(
            raw_nodes, metadata, last_topic_nodes
        )
        current_node_id = working_memory_response[0]
        extracted_query_info = working_memory_response[1]
        if extracted_query_info.routing_decision == GraphRoutingDecision.SLM.value \
                and extracted_query_info.confidence_score > 0.8: #TODO: Magic number
            self.wmg.build_graph(
                node_id=current_node_id,
                new_node=extracted_query_info,
            )
            asyncio.create_task(self.stag.commit_to_memory(current_node_id, extracted_query_info))
        return current_node_id, extracted_query_info 

    async def switch_engine(self, current_node_id: int, extracted_info: SlmExtractionResponse): 
        print("Current node id can be used for STAG commitment:", current_node_id)
        engine = extracted_info.routing_decision
        if engine == GraphRoutingDecision.STAG.value:
            self.stag.on_new_message(
                metadata=extracted_info
            ) 
        else:
            raw_nodes, metadata, _ = self.wmg.fetch_recent_nodes()
            return self.wmg.quick_answer(raw_nodes, metadata)