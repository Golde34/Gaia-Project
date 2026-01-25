from core.domain.request.memory_request import MemorySelectionToolDto
from core.usecase.llm_router.tool_selection import select_ability_tool

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
    def __init__(self, query: MemorySelectionToolDto):
        self.query = query

    async def switch(self) -> dict:
        return select_ability_tool(self.query)
