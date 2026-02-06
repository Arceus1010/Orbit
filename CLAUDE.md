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

# Database migrations (when implemented)
alembic revision --autogenerate -m "migration message"
alembic upgrade head
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

- `app/api/` - Route handlers/endpoints (empty - needs implementation)
- `app/models/` - SQLAlchemy ORM models (empty - needs implementation)
- `app/schemas/` - Pydantic request/response schemas (empty)
- `app/services/` - Business logic & AI integration service layer (empty)
- `app/core/` - Configuration, constants, security utilities (empty)
- `app/main.py` - FastAPI application entry point (basic boilerplate only)
- `app/.env` - Environment variables (DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY)

## Database Configuration

Database credentials are stored in `Orbit-Backend/app/.env` (not committed to git).
See `.env` for `DATABASE_URL` and other sensitive configuration.

### Planned Schema (not yet migrated)

**Core Tables:**
- `users` - Authentication (UUID, email, hashed_password, timestamps)
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
4. **ORM Patterns:** SQLAlchemy 2.0 uses new declarative syntax and async session patterns
5. **Component Structure:** Frontend follows atomic design principles - build reusable components in `src/components/`
6. **State Management:** Use TanStack Query for server state, React hooks for local state
7. **Error Handling:** FastAPI exception handlers should return consistent JSON error responses
8. **Mobile-First:** Tailwind CSS implementation should prioritize mobile-responsive design

## Documentation

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

**Not Yet Implemented:**
- Database models and migrations
- Authentication system (registration, login, JWT handling)
- API endpoints (beyond /health)
- Frontend pages and components
- AI service integration
- Task CRUD operations
- Project management features
