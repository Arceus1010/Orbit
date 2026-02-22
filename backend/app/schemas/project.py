"""Project Pydantic schemas for API request/response validation."""

import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

ProjectStatus = Literal["active", "archived", "completed"]


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["My Project"])
    description: Optional[str] = Field(None, max_length=1000)
    status: ProjectStatus = "active"
    color: Optional[str] = Field(None, max_length=7, examples=["#3B82F6"])


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[ProjectStatus] = None
    color: Optional[str] = Field(None, max_length=7)


class ProjectResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: Optional[str]
    status: str
    color: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
