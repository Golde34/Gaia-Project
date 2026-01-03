
from fastapi import APIRouter, HTTPException

from core.domain.request.tag_schedule_task_request import TagScheduleTaskRequestBody
from core.domain.response.base_response import return_success_response
from core.service.llm_business_handler_service import tag_schedule_tasks

GaiaBusinessRouter = APIRouter(
    prefix="/llm-business-handler",
    tags=["LLM Business Handler"],
)

@GaiaBusinessRouter.post("/tag-schedule-task")
async def tag_schedule_task(body: TagScheduleTaskRequestBody):
    userId = body.user_id
    tasks = body.tasks
    try:
        result = await tag_schedule_tasks(userId, tasks)
        return return_success_response(
            status_message="Tagged tasks successfully",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))