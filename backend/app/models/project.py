"""Project database model."""

import uuid
from datetime import datetime

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    # Stored as plain string; valid values: "active", "archived", "completed"
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
    )

    color: Mapped[str | None] = mapped_column(
        String(7),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="projects")  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', user_id={self.user_id})>"
