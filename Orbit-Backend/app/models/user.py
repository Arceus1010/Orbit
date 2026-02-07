"""
User model for authentication and authorization.

This module defines the User database model using SQLAlchemy 2.0 syntax.
Users are the primary entity in the system - they own projects and tasks.
"""
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# Type checking imports to avoid circular dependencies
if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.task import Task


class User(Base):
    """
    User model for authentication and data ownership.

    Attributes:
        id: Unique identifier (UUID v4)
        email: User's email address (unique, indexed for fast lookups)
        hashed_password: Bcrypt-hashed password (never store plaintext!)
        full_name: User's display name
        created_at: Timestamp when user registered
        updated_at: Timestamp of last update (auto-updated)
        projects: Relationship to user's projects (one-to-many)
        tasks: Relationship to user's tasks (one-to-many)

    Security Notes:
        - Passwords are NEVER stored in plaintext
        - Email is unique constraint at database level
        - UUID prevents enumeration attacks
        - Email is indexed for fast authentication queries
    """

    __tablename__ = "users"

    # Primary key: UUID for security (prevents enumeration)
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # Authentication fields
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,  # Index for fast login queries
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # User profile
    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Timestamps (using utcnow() for timezone-naive datetimes matching DB column type)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,  # Automatically updates on any change
        nullable=False,
    )

    # Relationships (commented out for now - will enable when creating Project/Task models)
    # projects: Mapped[list["Project"]] = relationship(
    #     back_populates="user",
    #     cascade="all, delete-orphan",  # Delete projects when user is deleted
    # )
    #
    # tasks: Mapped[list["Task"]] = relationship(
    #     back_populates="user",
    #     cascade="all, delete-orphan",  # Delete tasks when user is deleted
    # )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"
