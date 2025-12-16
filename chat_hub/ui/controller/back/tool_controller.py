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


@ToolRouter.post("/vectordb")
async def add_tool_vector(request: ToolVectorRequest):
    try:
        return await tool_usecase.add_tool_to_vectordb(
            tool=request.tool,
            description=request.description,
            sample_queries=request.sample_queries,
        )
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))


@ToolRouter.get("")
async def get_tools(tool: Optional[str] = None, need_history: Optional[bool] = None):
    try:
        return await tool_usecase.get_tools(tool=tool, need_history=need_history)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
