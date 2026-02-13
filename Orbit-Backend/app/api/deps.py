"""API dependencies for dependency injection."""

from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import oauth2_scheme, decode_access_token
from app.models.user import User


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    user_id_str: str | None = payload.get("sub")

    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = UUID(user_id_str)
    except (ValueError, AttributeError):
        raise credentials_exception

    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user
