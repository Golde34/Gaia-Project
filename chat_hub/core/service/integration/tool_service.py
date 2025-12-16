from typing import List, Optional

from core.domain.entities.tool import Tool
from infrastructure.repository.tool_repository import tool_repository


class ToolService:
    async def add(
        self,
        tool: str,
        description: str,
        *,
        json_schema: Optional[dict] = None,
        sample_queries: Optional[List[str]] = None,
        need_history: bool = False,
        is_active: bool = True,
    ) -> Tool:
        # TODO: Generate sample queries using LLM when not provided
        sample_queries = sample_queries or []

        tool_entity = Tool(
            tool=tool,
            description=description,
            json_schema=json_schema,
            sample_queries=sample_queries,
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


tool_service = ToolService()
