import traceback
from fastapi import APIRouter, HTTPException

from core.domain.request.query_request import QueryRequest
from core.service.base.service_handler import handle_task_service 


ChatRouter = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

@ChatRouter.post("/")
async def chat(query: QueryRequest):
    try:
        return handle_task_service(query=query)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
