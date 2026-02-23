"""User Pydantic schemas for API request/response validation."""

import re
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr = Field(..., examples=["john@example.com"])
    password: str = Field(..., min_length=8, max_length=100, examples=["SecurePass123!"])
    full_name: Optional[str] = Field(None, min_length=1, max_length=255, examples=["John Doe"])

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least 1 uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least 1 lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least 1 number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least 1 special character")
        return v


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
