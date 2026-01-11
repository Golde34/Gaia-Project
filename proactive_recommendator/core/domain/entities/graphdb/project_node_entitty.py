from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field


class ProjectNode(BaseModel):
    """
    Project entity for GraphDB
    Represents a project that contains multiple group tasks
    """
    id: str
    name: str
    description: str
    user_id: int
    description_vector: Optional[List[float]] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)
    active_status: str = "active"
    metadata: Optional[Dict] = None


class GroupTaskNode(BaseModel):
    """
    GroupTask entity for GraphDB
    Represents a group of tasks within a project
    """
    id: str
    title: str
    description: str
    description_vector: Optional[List[float]] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)
    active_status: str = "active"
    metadata: Optional[Dict] = None


class ProjectOwnershipEdge(BaseModel):
    """User owns Project"""
    user_id: int
    project_id: str


class ProjectGroupTaskEdge(BaseModel):
    """Project contains GroupTask"""
    project_id: str
    group_task_id: str