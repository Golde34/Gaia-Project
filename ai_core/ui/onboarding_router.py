from fastapi import APIRouter, HTTPException
import traceback

from core.domain.response.base_response import return_success_response
from core.domain.request import query_request
from core.service.onboarding_service import register_task, gaia_introduction 


OnboardingRouter = APIRouter(
    prefix="/onboarding",
    tags=["Onboarding"],
)

@OnboardingRouter.post("/introduce-gaia")
async def introduc_gaia(request: query_request.SystemRequest):
    try:
        response = await gaia_introduction(request)
        return return_success_response(
            status_message=f"GAIA introduction response successfully",
            data=response
        )
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@OnboardingRouter.post("/register-calendar")
async def register_task_config(request: query_request.SystemRequest):
    try:
        print("Received task config register request:", request)
        return register_task(request) 
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))