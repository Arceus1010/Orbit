"""
User Pydantic schemas for API request/response validation.

These schemas define the structure of data that the API accepts and returns.
They are separate from database models to provide flexibility and security.
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ========================================
# Request Schemas (API Input)
# ========================================

class UserCreate(BaseModel):
    """
    Schema for user registration.

    Used when a new user signs up via POST /auth/register.

    Attributes:
        email: User's email address (validated format)
        password: Plain text password (will be hashed before storage)
        full_name: User's display name

    Example:
        {
            "email": "john@example.com",
            "password": "SecurePass123!",
            "full_name": "John Doe"
        }
    """
    email: EmailStr = Field(
        ...,
        description="Valid email address",
        examples=["john@example.com"]
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password (min 8 characters)",
        examples=["SecurePass123!"]
    )
    full_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="User's full name (optional)",
        examples=["John Doe"]
    )


class UserLogin(BaseModel):
    """
    Schema for user login.

    Used when a user logs in via POST /auth/login.

    Attributes:
        email: User's email address
        password: User's password

    Example:
        {
            "email": "john@example.com",
            "password": "SecurePass123!"
        }
    """
    email: EmailStr = Field(
        ...,
        description="Email address",
        examples=["john@example.com"]
    )
    password: str = Field(
        ...,
        description="Password",
        examples=["SecurePass123!"]
    )


# ========================================
# Response Schemas (API Output)
# ========================================

class UserResponse(BaseModel):
    """
    Schema for user data in API responses.

    Used when returning user information to the client.
    IMPORTANT: Does NOT include password for security!

    Attributes:
        id: User's unique identifier
        email: User's email address
        full_name: User's display name
        created_at: When the user account was created
        updated_at: When the user account was last updated

    Example:
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "john@example.com",
            "full_name": "John Doe",
            "created_at": "2026-02-06T10:30:00Z",
            "updated_at": "2026-02-06T10:30:00Z"
        }
    """
    id: uuid.UUID
    email: str
    full_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration"""
        from_attributes = True  # Allows creating from SQLAlchemy models


class Token(BaseModel):
    """
    Schema for JWT token response.

    Returned after successful login or registration.

    Attributes:
        access_token: JWT token string
        token_type: Always "bearer" for JWT tokens

    Example:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer"
        }
    """
    access_token: str = Field(
        ...,
        description="JWT access token",
    )
    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer')",
    )


class TokenData(BaseModel):
    """
    Schema for data encoded in JWT token.

    Used internally to decode and validate JWT tokens.

    Attributes:
        user_id: User's UUID extracted from token (from "sub" claim)
    """
    user_id: Optional[uuid.UUID] = None
