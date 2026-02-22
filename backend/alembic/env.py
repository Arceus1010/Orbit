"""
Alembic environment configuration for async database migrations.

This module configures Alembic to work with our async SQLAlchemy setup.
It loads database configuration from app.core.config and imports all models
for autogenerate support.
"""
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Import our app configuration and database base
from app.core.config import settings
from app.core.database import Base, get_async_database_url

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Override the sqlalchemy.url with our settings
# Convert to async URL format for migrations
async_database_url = get_async_database_url(settings.DATABASE_URL)
config.set_main_option("sqlalchemy.url", async_database_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import all models here for 'autogenerate' support
# This ensures Alembic can detect changes to these models
from app.models.user import User  # ✅ User model created
from app.models.project import Project  # ✅ Project model created
# from app.models.task import Task  # TODO: Create Task model
# from app.models.subtask import Subtask  # TODO: Create Subtask model

# Set target_metadata to our Base metadata
# This tells Alembic about all our database models
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """
    Run migrations with the provided connection.

    This is called by run_migrations_online() within an async context.
    """
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Create an async engine and run migrations in async mode.

    This is the main function for running migrations with async SQLAlchemy.
    """
    # Create async engine from config
    # We need to modify the URL to use asyncpg driver
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # Run migrations synchronously within async context
        await connection.run_sync(do_run_migrations)

    # Dispose of the engine when done
    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    For async SQLAlchemy, we use asyncio to run the async migrations.
    """
    asyncio.run(run_async_migrations())


# Determine which mode to run in (offline or online)
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
