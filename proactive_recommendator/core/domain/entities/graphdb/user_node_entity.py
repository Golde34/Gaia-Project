from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field


class UserNode(BaseModel):
    """
    User entity for GraphDB
    Represents a user in the system with their basic information
    """
    user_id: int
    username: str
    name: str
    email: str
    active: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)
    metadata: Optional[Dict] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
