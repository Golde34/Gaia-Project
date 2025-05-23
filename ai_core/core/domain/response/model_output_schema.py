from pydantic import BaseModel
from typing import Optional


class CreateTaskSchema(BaseModel):
    project: str
    groupTask: str
    title: str
    priority: str
    status: str
    startDate: Optional[str] = None
    deadline: Optional[str] = None
    duration: Optional[str] = None
    actionType: Optional[str] = None 
    response: str 

class CreateTaskResultSchema(BaseModel):
    userId: int
    actionType: str
    projectId: str
    groupTaskId: str
    taskId: str
    title: str
    priority: str
    status: str
    startDate: Optional[str] = None
    deadline: Optional[str] = None
    duration: Optional[str] = None
    response: str
