import json
from typing import List, Optional

from core.domain.enums import enum
from core.domain.entities.database.tool import Tool
from core.domain.request.query_request import LLMModel
from core.domain.request.tool_request import ToolRequest
from core.prompts.system_prompt import SAMPLE_QUERIES_PROMPT
from infrastructure.repository.tool_repository import tool_repository
from kernel.config import config, llm_models


class ToolService:
    """
    Service layer for tool management operations.
    
    Handles the business logic for tool persistence, including entity creation
    and database interactions through the repository layer.
    """

    async def add(
        self,
        tool: str,
        description: str,
        *,
        json_schema: Optional[dict] = None,
        need_history: bool = False,
        is_active: bool = True,
    ) -> Tool:
        existed_tool = await tool_repository.query_tool_by_name(tool)
        if existed_tool:
            return existed_tool

        tool_entity = Tool(
            tool=tool,
            description=description,
            json_schema=json_schema,
            need_history=need_history,
            is_active=is_active,
        )
        return await tool_repository.create_tool(tool_entity)

    async def generate_sample_queries(
        self,
        tool_request: ToolRequest,
        num_samples: int = 20,
    ) -> List[str]:
        prompt = SAMPLE_QUERIES_PROMPT.format(
            tool=tool_request.tool,
            description=tool_request.description,
            examples=tool_request.sample_queries,
            num_samples=num_samples
        )
        
        response_schema = {
            "type": "array",
            "items": {
                "type": "string"
            }
        }

        llm_model = LLMModel(
            model_name=config.LLM_DEFAULT_MODEL,
            model_key=config.SYSTEM_API_KEY,
            memory_model=enum.MemoryModel.DEFAULT.value,
        )
        function = await llm_models.get_model_generate_content(llm_model, 0, prompt)
        result = function(prompt=prompt, model=llm_model, dto=response_schema)
        
        return json.loads(result)

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
