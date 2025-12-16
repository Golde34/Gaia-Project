import traceback
from typing import Optional

from fastapi import APIRouter, HTTPException

from core.domain.request.tool_request import ToolRequest, ToolVectorRequest
from core.usecase.tool_usecase import tool_usecase

ToolRouter = APIRouter(
    prefix="/tools",
    tags=["tools"],
)


@ToolRouter.post("")
async def add_tool(request: ToolRequest):
    """
    Create a new tool with database persistence and vector indexing.
    
    This endpoint:
    - Validates tool data
    - Persists the tool to the database
    - Indexes the tool in the vector database for semantic search
    
    Args:
        request: ToolRequest containing tool metadata including:
            - tool: Unique name for the tool
            - description: Detailed description of functionality
            - json_schema: Optional JSON schema for tool parameters
            - sample_queries: List of example queries (required)
            - need_history: Whether tool requires conversation history
            - is_active: Whether tool is active and available
            
    Returns:
        Tool: The created tool entity with all metadata
        
    Raises:
        HTTPException: 500 error if tool creation or indexing fails
    """
    try:
        return await tool_usecase.add_tool(
            tool=request.tool,
            description=request.description,
            json_schema=request.json_schema,
            sample_queries=request.sample_queries,
            need_history=request.need_history,
            is_active=request.is_active,
        )
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))




@ToolRouter.get("")
async def get_tools(tool: Optional[str] = None, need_history: Optional[bool] = None):
    """
    Retrieve tools with optional filtering.
    
    Args:
        tool: Optional tool name to filter by specific tool
        need_history: Optional boolean to filter tools by history requirement
            
    Returns:
        List[Tool]: List of tools matching the filter criteria
        
    Raises:
        HTTPException: 500 error if retrieval fails
    """
    try:
        return await tool_usecase.get_tools(tool=tool, need_history=need_history)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
