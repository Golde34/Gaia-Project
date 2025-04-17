from pydantic import BaseModel
from typing import Optional


class CreateTaskDto(BaseModel):
    Project: str
    GroupTask: str
    Title: str
    Priority: str
    Status: str
    StartDate: Optional[str] = None
    Deadline: Optional[str] = None
    Duration: Optional[str] = None