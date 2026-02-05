"""
Database configuration and session management.

This module sets up the SQLAlchemy async engine and provides database session
management for the Orbit backend application.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# Check for required async driver
try:
    import asyncpg  # noqa: F401
except ImportError:
    raise ImportError(
        "asyncpg is required for async database operations. "
        "Install it with: pip install asyncpg"
    )


def get_async_database_url(sync_url: str) -> str:
    """
    Convert synchronous PostgreSQL URL to async format.

    Handles both 'postgresql://' and 'postgres://' prefixes and converts
    them to the async driver format 'postgresql+asyncpg://'.

    Args:
        sync_url: Synchronous database URL from settings

    Returns:
        Async-compatible database URL with asyncpg driver

    Examples:
        postgresql://user:pass@host/db -> postgresql+asyncpg://user:pass@host/db
        postgres://user:pass@host/db -> postgresql+asyncpg://user:pass@host/db
    """
    if sync_url.startswith("postgresql://"):
        return sync_url.replace("postgresql://", "postgresql+asyncpg://")
    elif sync_url.startswith("postgres://"):
        return sync_url.replace("postgres://", "postgresql+asyncpg://")
    else:
        # Assume it's already in async format
        return sync_url


# Convert PostgreSQL URL to async version with asyncpg driver
ASYNC_DATABASE_URL = get_async_database_url(settings.DATABASE_URL)

# Create async engine with production-grade connection pool settings
# echo=True logs all SQL statements (useful for debugging)
# future=True enables SQLAlchemy 2.0 style
# pool_size: Number of connections to keep open (default: 5)
# max_overflow: Additional connections beyond pool_size (default: 10)
# pool_pre_ping: Verify connections are alive before using them
# pool_recycle: Recycle connections after this many seconds (prevents stale connections)
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=settings.DEBUG,  # Only log SQL in debug mode
    future=True,
    pool_size=5,  # Base connection pool size
    max_overflow=10,  # Maximum extra connections beyond pool_size
    pool_pre_ping=True,  # Test connections before use (catches dead connections)
    pool_recycle=3600,  # Recycle connections after 1 hour (3600 seconds)
)

# Create async session factory
# expire_on_commit=False prevents attributes from being expired after commit
# This is important for async operations where you might access objects after commit
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,  # Prevent automatic flushes (better control)
)


# Base class for all database models using SQLAlchemy 2.0 style
# All models will inherit from this class
class Base(DeclarativeBase):
    """
    Base class for all database models.

    This uses the modern SQLAlchemy 2.0 DeclarativeBase approach which
    provides better type hints and IDE support compared to declarative_base().

    All database models (User, Project, Task, etc.) should inherit from this class.

    Example:
        ```python
        class User(Base):
            __tablename__ = "users"
            id: Mapped[int] = mapped_column(primary_key=True)
            email: Mapped[str] = mapped_column(String(255), unique=True)
        ```
    """
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.

    This function will be used as a FastAPI dependency to provide
    database sessions to route handlers.

    Yields:
        AsyncSession: Database session

    Example:
        ```python
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
        ```
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def check_db_connection() -> bool:
    """
    Verify database connection is working.

    Attempts to execute a simple query to test database connectivity.
    Useful for health checks and startup validation.

    Returns:
        bool: True if connection successful, False otherwise

    Example:
        ```python
        if await check_db_connection():
            print("Database is ready!")
        else:
            print("Database connection failed!")
        ```
    """
    try:
        async with engine.begin() as conn:
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection check failed: {e}")
        return False


async def init_db() -> None:
    """
    Initialize database tables (DEVELOPMENT ONLY).

    Creates all tables defined in models that inherit from Base.
    This should ONLY be used in development environments.

    Raises:
        RuntimeError: If called in production (when DEBUG=False)

    Warning:
        Do NOT use this in production! Use Alembic migrations instead:
        `alembic upgrade head`

    Note:
        Before calling this, ensure all models are imported so they're
        registered with Base.metadata. Otherwise, tables won't be created.

    Example:
        ```python
        # In development startup
        if settings.DEBUG:
            await init_db()
        ```
    """
    # Safety check: prevent accidental use in production
    if not settings.DEBUG:
        raise RuntimeError(
            "init_db() should only be used in development (DEBUG=True). "
            "For production, use Alembic migrations: alembic upgrade head"
        )

    async with engine.begin() as conn:
        # Import all models here to ensure they're registered with Base
        # Uncomment these as you create the models:
        # from app.models.user import User
        # from app.models.project import Project
        # from app.models.task import Task
        # from app.models.subtask import Subtask

        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully!")


async def close_db() -> None:
    """
    Close database connections.

    This should be called during application shutdown to properly
    close all database connections and cleanup resources.
    """
    await engine.dispose()
