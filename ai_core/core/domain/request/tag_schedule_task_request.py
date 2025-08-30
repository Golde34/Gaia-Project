from pydantic import BaseModel, Field
from typing import List


class TagScheduleTaskRequest(BaseModel):
    task_id: str = Field(..., alias="taskId")
    schedule_task_id: str = Field(..., alias="scheduleTaskId")
    title: str

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True

class TagScheduleTaskRequestBody(BaseModel):
    user_id: int = Field(..., alias="userId")
    tasks: List[TagScheduleTaskRequest]

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True