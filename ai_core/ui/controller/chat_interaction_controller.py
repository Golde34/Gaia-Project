import traceback
from fastapi import APIRouter, HTTPException, Request

from core.usecase.chat import ChatUsecase as chat_usecase


ChatInteractionRouter = APIRouter(
    prefix="/chat-interaction",
    tags=["chat-interaction"],
)

@ChatInteractionRouter.post("/initiate-chat")
async def initiate_chat(request: Request):
    try:
        user_info = getattr(request.state, "user", None)
        if not user_info:
            raise HTTPException(status_code=401, detail="Unauthorized: User info missing")
        user_id = user_info["user_id"]
        return await chat_usecase.initiate_chat(user_id=user_id)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
