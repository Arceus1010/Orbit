# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Orbit** is an AI-powered project management app that uses Claude to transform rough task notes into structured, actionable items with smart prioritization, deadlines, and subtask suggestions.

**Status:** Phase 1 Complete — Backend auth system and frontend API client are implemented. Phase 2 (UI pages) is next.

## Architecture

```
[React Frontend]  ←→  [FastAPI Backend]  ←→  [PostgreSQL]
   :5173                  :8000                 :5432
                             ↓
                     [Anthropic Claude API]
```

- **Frontend:** React 19 + TypeScript (strict) + Vite 7 + Tailwind CSS 4 (Vite plugin) + TanStack Query + Axios + React Router DOM + Headless UI + Heroicons
- **Backend:** FastAPI (async) + SQLAlchemy 2.0 (async with asyncpg) + Pydantic 2 + Alembic + python-jose (JWT) + Passlib (bcrypt) + email-validator + HTTPX

## Development Commands

### Frontend (`Orbit-Frontend/`)

```bash
npm run dev       # Dev server at localhost:5173
npm run build     # TypeScript check + production build
npm run lint      # ESLint
```

### Backend (`Orbit-Backend/`)

All backend commands run from `Orbit-Backend/` with venv activated (`venv\Scripts\activate` on Windows, `source venv/bin/activate` on Unix).

```bash
python -m uvicorn app.main:app --reload   # Dev server at localhost:8000
```

Swagger UI: `http://localhost:8000/docs` | Health: `GET /health`, `GET /health/db`

### Environment Setup

Backend env file lives at `Orbit-Backend/app/.env`. Copy from `Orbit-Backend/.env.example` and fill in actual values (DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY).

### Alembic Migrations (from `Orbit-Backend/`)

```bash
alembic revision --autogenerate -m "description"   # Generate migration
alembic upgrade head                                # Apply all
alembic downgrade -1                                # Rollback last
```

After creating/modifying a model, import it in `alembic/env.py` before running autogenerate. Never use `Base.metadata.create_all()` — always use Alembic.

### Tests

No test framework is configured yet for either frontend or backend.

## Key Architecture Decisions

### Backend

- **Async everywhere:** All handlers, DB ops, and services use async/await. Database URLs auto-convert from `postgresql://` to `postgresql+asyncpg://` in `app/core/database.py`.
- **SQLAlchemy 2.0 syntax:** Models use `Mapped` type hints, `mapped_column()`, and inherit from `Base` (a `DeclarativeBase` in `app/core/database.py`).
- **Dependency injection:** Use `Depends(get_db)` for sessions, `Depends(get_current_user)` for auth (implemented in `app/api/deps.py`).
- **Ownership verification:** Every endpoint accessing user resources must filter by `user_id == current_user.id`. Never use bare `db.get(Model, id)` for user-owned data — always include ownership in the query `where` clause.
- **Config:** `app/core/config.py` uses Pydantic Settings loading from `app/.env`. Global singleton: `settings`.
- **Auth:** JWT (HS256) signed with SECRET_KEY, 30-min expiry. Passwords hashed with bcrypt. OAuth2 token URL: `auth/login`.
- **CORS:** Allows `http://localhost:5173` only. Must update for production.

### Frontend

- **TypeScript strict mode** with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`.
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (not PostCSS). Configured in `vite.config.ts`, not `postcss.config.js`.
- **TanStack Query** for server state with configured `QueryClient` (1-min stale time, 5-min cache). Query keys defined in `src/lib/queryClient.ts`.
- **Axios instance** (`src/lib/axios.ts`) with request/response interceptors for automatic JWT token management (localStorage).
- **5-layer architecture:** Component → Hook → Service → Axios → Backend. New features should follow this pattern: define types in `src/types/`, API calls in `src/services/`, React hooks in `src/hooks/`, then use hooks in components.

## Current Implementation State

### What Exists
- **Auth system (backend):** Register, login, get-current-user endpoints in `app/api/auth.py`
- **Auth client (frontend):** Types, service functions, and React hooks for the auth flow
- **Database:** `users` table (UUID pk, email unique+indexed, hashed_password, full_name nullable, timestamps) managed via Alembic migrations
- **Core infra:** Config, async DB engine, security utilities, health endpoints, CORS

### What's NOT Implemented
- **Project/Task System:** Models, schemas, and endpoints for projects → tasks → subtasks hierarchy (all with `user_id` FKs). The User model has commented-out relationship definitions ready for this.
- **AI Integration:** Service layer for Claude API calls (task enhancement, smart suggestions)
- **Frontend UI Pages:** Login/Register pages, Dashboard, Project/Task views. `App.tsx` still uses the default Vite template. React Router DOM is installed but not configured.

## Known Issues

### Windows Console Emoji Encoding
Backend startup fails with `UnicodeEncodeError` when printing emojis in Windows console (cp1252). Use VS Code integrated terminal or Windows Terminal instead.

### Timestamp Timezone Handling
SQLAlchemy models must use `datetime.utcnow()` (not `datetime.now(timezone.utc)`) to match PostgreSQL `TIMESTAMP WITHOUT TIME ZONE` columns. Mixing naive and aware datetimes causes `can't subtract offset-naive and offset-aware datetimes`.
