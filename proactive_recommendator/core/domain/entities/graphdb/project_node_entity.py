from typing import Any, Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field


class ProjectNode(BaseModel):
    id: str  # project_id
    name: str
    user_id: int
    description: Optional[str] = None
    category: Optional[str] = None
    last_action_at: datetime = Field(default_factory=datetime.now)
    active_status: str = "active"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GroupTaskNode(BaseModel):
    """
    Group activity count increase mechanism:
    Add task into this group => activity_count += 1
    """
    id: str  # group_task_id
    project_id: str
    title: str
    description: Optional[str] = None
    last_action_at: datetime = Field(default_factory=datetime.now)
    activity_count: int = 0 
    active_status: str = "active"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ProjectOwnershipEdge(BaseModel):
    """User owns Project"""
    user_id: int
    project_id: str


class ProjectGroupTaskEdge(BaseModel):
    """Project contains GroupTask"""
    project_id: str
    group_task_id: str