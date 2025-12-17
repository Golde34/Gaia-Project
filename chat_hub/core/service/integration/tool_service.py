import json
from typing import List, Optional

from chat_hub.core.domain.request.query_request import QueryRequest
from chat_hub.core.domain.request.tool_request import ToolRequest
from chat_hub.core.prompts.system_prompt import SAMPLE_QUERIES_PROMPT
from chat_hub.kernel.config import config, llm_models
from core.domain.entities.tool import Tool
from infrastructure.repository.tool_repository import tool_repository


class ToolService:
    """
    Service layer for tool management operations.
    
    Handles the business logic for tool persistence, including entity creation
    and database interactions through the repository layer.
    """

    async def generate_sample_queries(
        self,
        tool: str,
        description: str,
        num_samples: int = 20,
    ) -> List[str]:
        prompt = SAMPLE_QUERIES_PROMPT.format(
            tool=tool,
            description=description,
            num_samples=num_samples
        )
        
        response_schema = {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
        
        function = await llm_models.get_model_generate_content(config.LLM_DEFAULT_MODEL, 0, prompt)
        result = function(prompt=prompt, model=config.LLM_DEFAULT_MODEL, dto=response_schema)
        
        return json.loads(result)

    async def add(
        self,
        tool: str,
        description: str,
        *,
        json_schema: Optional[dict] = None,
        need_history: bool = False,
        is_active: bool = True,
    ) -> Tool:
        sample_queries = sample_queries or []

        tool_entity = Tool(
            tool=tool,
            description=description,
            json_schema=json_schema,
            need_history=need_history,
            is_active=is_active,
        )
        return await tool_repository.create_tool(tool_entity)

    async def get(
        self,
        *,
        tool: Optional[str] = None,
        need_history: Optional[bool] = None,
    ) -> List[Tool]:
        return await tool_repository.get_tools(tool_name=tool, need_history=need_history)
    
    async def update(
        self,
        tool_id: str,
        sample_queries: List[str],
    ) -> Tool:
        return await tool_repository.update_sample_queries(tool_id, sample_queries)


tool_service = ToolService()
