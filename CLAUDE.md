# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Orbit** is an AI-powered project management application that uses Claude/GPT to transform rough task notes into structured, actionable items with smart prioritization, deadlines, and subtask suggestions.

**Current Status:** MVP Phase - Initial boilerplate setup complete, core features not yet implemented.

## Architecture

Three-tier architecture with AI integration:

```
[React Frontend] ←→ [FastAPI Backend] ←→ [PostgreSQL Database]
      :5173              :8000               :5432
                            ↓
                    [Anthropic Claude API]
```

### Frontend Stack
- React 19.2.0 + TypeScript (strict mode)
- Vite 7.2.4 (bundler with HMR)
- Tailwind CSS 4.1.18
- TanStack React Query 5.90.20 (data fetching/caching)
- Axios 1.13.4 (HTTP client)
- React Router DOM 7.13.0

### Backend Stack
- FastAPI 0.128.0 (Python async framework)
- SQLAlchemy 2.0.46 (ORM)
- PostgreSQL 15+ with psycopg2-binary
- Python-Jose 3.5.0 (JWT authentication)
- Pydantic 2.12.5 (validation)
- Alembic 1.18.3 (migrations)
- HTTPX 0.28.1 (async HTTP for AI API calls)

## Development Commands

### Frontend (Orbit-Frontend/)

```bash
# Start development server
npm run dev

# Build for production (includes TypeScript check)
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install dependencies
npm install
```

Development server runs on `http://localhost:5173`

### Backend (Orbit-Backend/)

```bash
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start development server with auto-reload
python -m uvicorn app.main:app --reload

# Run without reload
python -m uvicorn app.main:app

# Database migrations
# First time setup:
alembic init alembic
# Then configure alembic.ini and alembic/env.py

# Create new migration after model changes:
alembic revision --autogenerate -m "migration message"

# Apply migrations:
alembic upgrade head

# Rollback last migration:
alembic downgrade -1

# View migration history:
alembic history
```

API server runs on `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

### Frontend: `/Orbit-Frontend`

- `src/components/` - Reusable UI components (empty - ready for implementation)
- `src/pages/` - Page-level components for routing (empty)
- `src/services/` - API service layer for backend communication (empty)
- `src/hooks/` - Custom React hooks (empty)
- `src/types/` - TypeScript type definitions (empty)
- `src/utils/` - Utility functions (empty)
- `src/App.tsx` - Root component
- `src/main.tsx` - Application entry point

### Backend: `/Orbit-Backend`

- `app/api/` - Route handlers/endpoints (empty - needs auth, projects, tasks)
- `app/models/` - SQLAlchemy ORM models:
  - ✅ `user.py` - User model (IMPLEMENTED)
  - `project.py` - Project model (TODO)
  - `task.py` - Task model (TODO)
  - `subtask.py` - Subtask model (TODO)
- `app/schemas/` - Pydantic request/response schemas:
  - ✅ `user.py` - User schemas (IMPLEMENTED)
  - Project, Task, Subtask schemas (TODO)
- `app/services/` - Business logic & AI integration service layer (empty)
- `app/core/` - **Core utilities (IMPLEMENTED):**
  - `config.py` - Pydantic Settings for environment variables
  - `database.py` - Async SQLAlchemy engine, Base class, session management
  - `security.py` - Password hashing, JWT token creation/verification
- `app/main.py` - FastAPI application with lifespan management, CORS, health endpoints
- `app/.env` - Environment variables (DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY, DEBUG)
- `alembic/` - **Database migrations (CONFIGURED):**
  - `env.py` - Async migration environment
  - `versions/97569930fbf9_create_users_table.py` - Applied migration

## Database Configuration

Database credentials are stored in `Orbit-Backend/app/.env` (not committed to git).
See `.env` for `DATABASE_URL` and other sensitive configuration.

### Database Schema

**Implemented Tables:**
- ✅ `users` - Authentication (UUID, email, hashed_password, full_name, created_at, updated_at)
  - Indexes: email (unique), id
  - Migration: 97569930fbf9

**Planned Tables:**
- `projects` - Task containers (UUID, user_id FK, name, description, status, color)
- `tasks` - Work items (UUID, user_id FK, project_id FK, title, description, priority, status, due_date, tags JSON, raw_input, ai_enhanced flag)
- `subtasks` - Task breakdowns (UUID, task_id FK, title, completed boolean, order_index)

**Relationships:**
- Users have many projects and tasks
- Projects have many tasks
- Tasks have many subtasks

## AI Integration Strategy

**Primary AI:** Anthropic Claude (claude-3-5-sonnet-20241022)
**Backup:** OpenAI GPT
**API Key:** Stored in `ANTHROPIC_API_KEY` environment variable

### AI Use Cases (to be implemented)
1. **Task Enhancement** - Transform rough input into structured task with title, description, tags
2. **Smart Prioritization** - Analyze keywords to suggest priority levels
3. **Deadline Suggestions** - Infer due dates from context ("next week", "urgent")
4. **Subtask Generation** - Break down complex tasks into actionable steps
5. **Pattern Learning** - (Phase 2) Learn user preferences over time

Implementation should use async/await patterns with HTTPX for API calls, include rate limiting and caching.

## Authentication Flow

Uses JWT token-based authentication:
- Registration/login endpoints return JWT access tokens
- `SECRET_KEY` for signing: stored in `.env`
- Token expiry: 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- Password hashing: Bcrypt via Passlib
- Protected routes use FastAPI dependency injection for token validation

## CORS Configuration

Backend allows cross-origin requests from frontend:
```python
allow_origins=["http://localhost:5173"]  # Vite dev server
```

Production deployment will need to update this to match deployed frontend URL.

## Key Implementation Notes

1. **TypeScript Strict Mode:** Frontend uses strict TypeScript configuration - ensure all types are properly defined
2. **Async Patterns:** Backend uses async/await throughout - all route handlers and service methods should be async
3. **Data Validation:** Use Pydantic schemas for all API request/response validation
4. **ORM Patterns:** SQLAlchemy 2.0 uses new declarative syntax and async session patterns with `asyncpg` driver
5. **Component Structure:** Frontend follows atomic design principles - build reusable components in `src/components/`
6. **State Management:** Use TanStack Query for server state, React hooks for local state
7. **Error Handling:** FastAPI exception handlers should return consistent JSON error responses
8. **Mobile-First:** Tailwind CSS implementation should prioritize mobile-responsive design
9. **Database URLs:** The system automatically converts sync PostgreSQL URLs to async format (`postgresql+asyncpg://`)
10. **Session Management:** Use `get_db()` dependency for database sessions - never create sessions manually
11. **Security:** All passwords hashed with bcrypt, JWT tokens signed with `SECRET_KEY`, 30-minute expiration
12. **Ownership Verification:** EVERY endpoint that accesses user data must verify ownership to prevent unauthorized access

## Critical Architectural Patterns

### Database Model Pattern (SQLAlchemy 2.0)
All models must use modern SQLAlchemy 2.0 syntax with `Mapped` type hints:

```python
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    projects: Mapped[list["Project"]] = relationship(back_populates="user")
```

### Dependency Injection Pattern
Use FastAPI dependencies for database sessions and authentication:

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user

@router.get("/projects")
async def get_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # db session and current_user automatically provided
    pass
```

### Ownership Verification Pattern
Every endpoint accessing user resources MUST verify ownership:

```python
# BAD - Security vulnerability
project = await db.get(Project, project_id)

# GOOD - Verify ownership
project = await db.execute(
    select(Project).where(
        Project.id == project_id,
        Project.user_id == current_user.id
    )
)
project = project.scalar_one_or_none()
if not project:
    raise HTTPException(status_code=404, detail="Project not found")
```

### Alembic Migration Workflow
1. Modify model in `app/models/`
2. Import model in `alembic/env.py` target_metadata
3. Run: `alembic revision --autogenerate -m "description"`
4. Review generated migration file
5. Apply: `alembic upgrade head`

**NEVER** use `Base.metadata.create_all()` in production - always use Alembic migrations.

## Documentation

See `/Orbit Development Kickstart Plan.md` for detailed implementation guide with 8 phases.

See `/Product Requirement Document V1.md` for:
- Comprehensive feature specifications (MVP through Phase 3)
- User personas and use cases
- Success metrics and KPIs
- 6-24 month development roadmap
- Detailed technical architecture decisions

## Current Implementation Status

**Completed:**
- Frontend boilerplate (Vite + React + TypeScript + Tailwind)
- Backend skeleton (FastAPI with CORS and health check endpoint)
- Environment configuration and dependency management
- **Core Infrastructure (Phase 1, Days 1-2):**
  - `app/core/config.py` - Pydantic Settings with environment variable loading
  - `app/core/database.py` - SQLAlchemy async engine, session factory, Base class
  - `app/core/security.py` - Password hashing (bcrypt), JWT token creation/verification
  - Database connection testing via `/health/db` endpoint
- **User Model & Migrations (Phase 1, Days 3-4):**
  - Alembic initialized and configured for async migrations
  - `app/models/user.py` - User model with UUID, email, hashed_password, timestamps
  - `app/schemas/user.py` - Pydantic schemas (UserCreate, UserLogin, UserResponse, Token, TokenData)
  - `alembic/versions/97569930fbf9_create_users_table.py` - Migration applied
  - PostgreSQL `users` table created with indexes

**Not Yet Implemented:**
- Authentication endpoints (`app/api/auth.py`, `app/api/deps.py`)
- Frontend pages and components
- AI service integration
- Project/Task/Subtask models and endpoints
- Task CRUD operations
- Project management features
