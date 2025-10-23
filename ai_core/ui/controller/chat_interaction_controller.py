import traceback
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional

from core.middleware import validate_access_token


ChatInteractionRouter = APIRouter(
    prefix="/chat-interaction",
    tags=["chat-interaction"],
)

@ChatInteractionRouter.post("/initiate-chat")
async def initiate_chat(request: Request, user_info: Optional[dict] = Depends(validate_access_token)):
    try:
        return None
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
