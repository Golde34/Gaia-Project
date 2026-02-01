from core.domain.request.query_request import QueryRequest


class ShortTermActivationGraph:
    def __init__(self, query: QueryRequest):
        self.query = query

    async def add_stag_node(self, node_data: dict):
        """Add node to STAG layer (Neo4j)"""
        print("TODO: Implement STAG node addition")
        pass