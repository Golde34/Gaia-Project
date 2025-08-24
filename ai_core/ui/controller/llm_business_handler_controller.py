from typing import List

from fastapi import APIRouter, HTTPException

from core.domain.request.tag_schedule_task_request import TagScheduleTaskRequest
from core.domain.response.base_response import return_success_response
from core.service.llm_business_handler_service import tag_schedule_tasks

LLMBusinessHandlerRouter = APIRouter(
    prefix="/llm-business-handler",
    tags=["LLM Business Handler"],
)

@LLMBusinessHandlerRouter.post("/tag-schedule-task")
async def tag_schedule_task(tasks: List[TagScheduleTaskRequest]):
    try:
        result = await tag_schedule_tasks(tasks)
        return return_success_response(
            status_message="Tagged tasks successfully",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
