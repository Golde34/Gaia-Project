from pydantic import BaseModel, Field
from typing import List, Dict, Optional

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


class TimeBubbleDTO(BaseModel):
    start: str = Field(..., description="Start time in HH:MM format")
    end: str = Field(..., description="End time in HH:MM format")
    tag: str = Field(
        ...,
        description="One of 'work', 'eat', 'travel', 'relax', or 'sleep'"
    )

class TotalsDTO(BaseModel):
    work: float = Field(..., description="Total hours spent working")
    eat: float = Field(..., description="Total hours spent eating")
    travel: float = Field(..., description="Total hours spent traveling")
    relax: float = Field(..., description="Total hours spent relaxing")
    sleep: float = Field(..., description="Total hours spent sleeping")

class DailyRoutineSchema(BaseModel):
    """
    schedule: keys are weekday numbers as strings "2".."6" (Mon–Fri),
              values are lists of TimeBlockDto
    totals: TotalsDto summarizing total hours per tag
    """
    schedule: Dict[str, List[TimeBubbleDTO]] = Field(
        ...,
        description="Map of day-of-week to list of time blocks"
    )
    totals: TotalsDTO = Field(..., description="Summary of total hours per tag")
    response: str = Field(..., description="LLM-generated response text")
 

class LongTermMemorySchema(BaseModel):
    """
    Schema for long-term memory content.
    """
    content: List[str]= Field(..., description="Content of the long-term memory")
