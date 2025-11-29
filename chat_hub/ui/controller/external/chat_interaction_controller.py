import traceback
from fastapi import APIRouter, HTTPException, Request

from core.domain.request.chat_hub_request import SendMessageRequest
from core.domain.response.base_response import return_success_response
from core.usecase.chat_interact_usecase import chat_interaction_usecase as usecase
from kernel.utils import build_header

ChatInteractionRouter = APIRouter(
    prefix="/chat-interaction",
    tags=["chat-interaction"],
)

@ChatInteractionRouter.post("/initiate-chat")
async def initiate_chat(request: Request):
    try:
        user_info = _user_info_from_middleware(request)
        user_id = int(user_info["user_id"])
        return await usecase.initiate_chat(user_id=user_id)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

def _user_info_from_middleware(request: Request):
    user_info = getattr(request.state, "user", None)
    if not user_info:
        raise HTTPException(
            status_code=401, detail="Unauthorized: User info missing")
    return user_info

@ChatInteractionRouter.get("/history")
async def get_chat_history(request: Request):
    try:
        user_info = _user_info_from_middleware(request)
        user_id = int(user_info["user_id"])
        dialogue_id = request.query_params.get("dialogueId", "")

        size = int(request.query_params.get("size", "10"))
        cursor = request.query_params.get("cursor", "")

        response = await usecase.get_chat_history_from_db(
            user_id=user_id,
            dialogue_id=dialogue_id,
            size=size,
            cursor=cursor
        )
        return response
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@ChatInteractionRouter.get("/dialogues")
async def get_user_dialogues(request: Request):
    try:
        user_info = _user_info_from_middleware(request)
        user_id = int(user_info["user_id"])
        size = int(request.query_params.get("size", "20"))
        cursor = request.query_params.get("cursor", "")
        response = await usecase.get_chat_dialogues(
            user_id=user_id,
            size=size,
            cursor=cursor
        )
        return return_success_response("Fetched dialogues successfully", response)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
