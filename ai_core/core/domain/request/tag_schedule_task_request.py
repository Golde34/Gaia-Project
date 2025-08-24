from pydantic import BaseModel

class TagScheduleTaskRequest(BaseModel):
    userId: int 
    taskId: str
    scheduleTaskId: str
    title: str