import traceback
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from core.domain.request.chat_hub_request import SendMessageRequest
from core.usecase.chat_interaction_usecase import chat_interaction_usecase as usecase
from kernel.utils import build_header


ChatSystemRouter = APIRouter(
    prefix="/chat-system",
    tags=["chat-system"],
)


@ChatSystemRouter.get("/send-message")
async def send_message(dialogue_id: str = Query(..., alias="dialogueId"),
                       message: str = Query(...),
                       msg_type: Optional[str] = Query(None, alias="type"),
                       sse_token: str = Query(..., alias="sseToken")
                       ):
    request = SendMessageRequest(
        dialogue_id=dialogue_id,
        message=message,
        msg_type=msg_type,
        sse_token=sse_token
    )
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="Message is required")

        user_id = build_header.decode_sse_token(request.sse_token)
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid SSE token")

        return await usecase.handle_send_message(int(user_id), request)

    except HTTPException:
        raise
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
