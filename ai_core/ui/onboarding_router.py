from fastapi import APIRouter, HTTPException
import traceback

from core.domain.request import query_request
from core.service.onboarding_service import register_task, gaia_introduction 


OnboardingRouter = APIRouter(
    prefix="/onboarding",
    tags=["Onboarding"],
)

@OnboardingRouter.get("/gaia-introduction")
async def gaia_introduction(request: query_request.SystemRequest):
    try:
        print("Received GAIA introduction request")
        return await gaia_introduction(request)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@OnboardingRouter.post("/task-register")
async def register_task_config(request: query_request.SystemRequest):
    try:
        print("Received task config register request:", request)
        return register_task(request) 
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))