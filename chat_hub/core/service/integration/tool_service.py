from typing import List, Optional

from core.domain.entities.tool import Tool
from infrastructure.repository.tool_repository import tool_repository


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
        sample_queries: Optional[List[str]] = None,
        need_history: bool = False,
        is_active: bool = True,
    ) -> Tool:
        """
        Create and persist a new tool entity.
        
        Args:
            tool: Unique name for the tool
            description: Detailed description of the tool's functionality
            json_schema: Optional JSON schema defining tool parameters
            sample_queries: Optional list of example queries demonstrating tool usage
                TODO: Generate sample queries using LLM when not provided
            need_history: Whether the tool requires conversation history
            is_active: Whether the tool is active and available
            
        Returns:
            Tool: The created and persisted tool entity
        """
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
        """
        Retrieve tools from the database with optional filtering.
        
        Args:
            tool: Optional tool name to filter by
            need_history: Optional flag to filter tools by history requirement
            
        Returns:
            List[Tool]: List of tools matching the filter criteria
        """
        return await tool_repository.get_tools(tool_name=tool, need_history=need_history)


tool_service = ToolService()
