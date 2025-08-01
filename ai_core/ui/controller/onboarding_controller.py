from fastapi import APIRouter

from core.domain.enums import enum
from ui.controller.base.base_controller import generate_sse_stream, handle_sse_stream 


OnboardingRouter = APIRouter(
    prefix="/onboarding",
    tags=["Onboarding"],
)

@OnboardingRouter.get("/introduce-gaia")
async def sse_onboarding_stream(
    dialogue_id: str = "",
    message: str = "",
    model_name: str = "gemini-2.0-flash",
    user_id: str = None,
):
    """
    SSE streaming endpoint for onboarding introduction.
    """
    return await handle_sse_stream(
        dialogue_id, message, model_name, user_id, enum.ChatType.GAIA_INTRODUCTION
    )


@OnboardingRouter.get("/register-calendar")
async def sse_calendar_stream(
    dialogue_id: str = "",
    message: str = "",
    model_name: str = "gemini-2.0-flash",
    user_id: str = None,
):
    """
    SSE streaming endpoint for calendar registration.
    """
    return await handle_sse_stream(
        dialogue_id, message, model_name, user_id, enum.ChatType.REGISTER_SCHEDULE_CALENDAR
    )
