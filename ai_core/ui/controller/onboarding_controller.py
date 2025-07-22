import traceback
from fastapi import APIRouter, HTTPException

from core.domain.enums import enum
from core.domain.request import query_request
from core.usecase.chat import ChatUsecase as chatUsecase 


OnboardingRouter = APIRouter(
    prefix="/onboarding",
    tags=["Onboarding"],
)

@OnboardingRouter.post("/introduce-gaia")
async def introduc_gaia(request: query_request.QueryRequest):
    try:
        return await chatUsecase.chat(query=request, chat_type=enum.ChatType.GAIA_INTRODUCTION.value)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@OnboardingRouter.post("/register-calendar")
async def register_calendar(request: query_request.QueryRequest):
    try:
        return await chatUsecase.chat(query=request, chat_type=enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))