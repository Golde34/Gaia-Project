from typing import Optional, List
from pydantic import BaseModel


class GroupTaskItem(BaseModel):
    task_id: str
    task_name: str
    description: Optional[str]
    activity_count: Optional[int]


class ProjectItem(BaseModel):
    project_id: str
    project_name: str
    description: Optional[str]
    category: Optional[str]
    relevance_score: Optional[str]
    group_tasks: List[GroupTaskItem]


class ProjectListResponse(BaseModel):
    reasoning: str
    projects: List[ProjectItem]