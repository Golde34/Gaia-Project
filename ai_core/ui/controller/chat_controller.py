import traceback
from fastapi import APIRouter, HTTPException

from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.usecase.chat import ChatUsecase as chatUsecase 
from ui.controller.base.base_controller import handle_sse_stream 


ChatRouter = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

@ChatRouter.post("/")
async def chat_abilities(query: QueryRequest):
    try:
        return await chatUsecase.chat(query=query, chat_type=enum.ChatType.ABILITIES.value)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@ChatRouter.get("/send-message")
async def send_message(
    dialogue_id: str = "",
    message: str = "",
    model_name: str = "gemini-2.0-flash",
    user_id: str = None,
):
    """
    SSE streaming endpoint for onboarding introduction.
    """
    return await handle_sse_stream(
        dialogue_id, message, model_name, user_id, enum.ChatType.ABILITIES.value
    )
