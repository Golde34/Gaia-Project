from core.domain.request.query_request import QueryRequest


class SwitchingEngine:
    """
    SwitchingEngine is responsible for determining the appropriate memory model will be used based on incoming requests.
    Call LLM to analyze the request, and response 2 thing:
    - tool: str: the tool user want to use, e.g., create task, daily routine, long term memory
    - memory_model: str: the memory model to use, e.g., STAG, SLTM, EMG

    query: QueryRequest

    Response:
    tool: str
    memory_model: str
    query: QueryRequest
    """
    def __init__(self, query: QueryRequest):
        self.query = query

    def switch(self) -> dict:
        # Use semantic search to verify the list of tools
        # If the tool is not in the list or the list of tools has values lower than threshold
        # Call LLM to determine the tool and memory model
        pass

    def _semantic_search(self) -> dict:
        # Use semantic search to verify the list of tools
        pass

    def _call_llm(self) -> dict:
        # Call LLM to determine the tool and memory model
        pass
