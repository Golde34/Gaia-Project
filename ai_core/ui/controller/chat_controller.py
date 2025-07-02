import traceback
from fastapi import APIRouter, HTTPException

from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.usecase.chat import ChatUsecase as chatUsecase 


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
