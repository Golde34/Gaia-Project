from fastapi import APIRouter, HTTPException
import traceback

from core.domain.request import query_request
from ui.controller.chat_controller import handle_user_prompt

ChatRouter = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

@ChatRouter.post("/")
async def chat(request: query_request.QueryRequest):
    try:
        print("Received request:", request)
        return handle_user_prompt(query=request)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))