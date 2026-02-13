"""User Pydantic schemas for API request/response validation."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr = Field(..., examples=["john@example.com"])
    password: str = Field(..., min_length=8, max_length=100, examples=["SecurePass123!"])
    full_name: Optional[str] = Field(None, min_length=1, max_length=255, examples=["John Doe"])


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
