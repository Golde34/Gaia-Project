from pydantic import BaseModel

class TagScheduleTaskRequest(BaseModel):
    taskId: str
    scheduleTaskId: str
    title: str
