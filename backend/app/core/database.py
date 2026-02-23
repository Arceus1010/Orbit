"""Database configuration and session management."""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    import asyncpg  # noqa: F401
except ImportError:
    raise ImportError(
        "asyncpg is required for async database operations. "
        "Install it with: pip install asyncpg"
    )


def get_async_database_url(sync_url: str) -> str:
    """Convert synchronous PostgreSQL URL to async format."""
    if sync_url.startswith("postgresql://"):
        return sync_url.replace("postgresql://", "postgresql+asyncpg://")
    elif sync_url.startswith("postgres://"):
        return sync_url.replace("postgres://", "postgresql+asyncpg://")
    return sync_url


ASYNC_DATABASE_URL = get_async_database_url(settings.DATABASE_URL)

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def check_db_connection() -> bool:
    try:
        async with engine.begin() as conn:
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False


async def close_db() -> None:
    await engine.dispose()
