import asyncio
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
        
    async def switch_engine(self):
        raw_nodes, metadata, last_topic_nodes = self.wmg.fetch_recent_nodes()
        extracted_query_info: SlmExtractionResponse = await self.wmg.quick_think(
            raw_nodes, metadata
        )
        if extracted_query_info.routing_decision == GraphRoutingDecision.SLM.value \
                and extracted_query_info.confidence_score > 0.8:
            self.wmg.build_graph(
                new_node=extracted_query_info,
                last_topic_nodes=last_topic_nodes 
            )
            asyncio.create_task(self.stag.add_stag_node(extracted_query_info))
        return extracted_query_info.routing_decision, extracted_query_info 