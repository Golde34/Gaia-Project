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
        return await tool_usecase.add_tool(request)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))


@ToolRouter.post("/samples")
async def add_tool_to_vectordb(request: ToolVectorRequest):
    try:
        result = await tool_usecase.add_tool_to_vectordb(
            tool=request.tool,
            description=request.description,
            sample_queries=request.sample_queries,
        )
        return {
            "message": "Tool successfully added to vector database",
            "tool": request.tool,
            "result": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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

