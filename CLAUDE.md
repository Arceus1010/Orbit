# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Orbit** is an AI-powered project management app that uses Claude to transform rough task notes into structured, actionable items with smart prioritization, deadlines, and subtask suggestions.

**Status:** Early MVP — core infrastructure, user model, and authentication system are fully implemented. Project/task models, AI integration, and frontend pages are not yet built.

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

### Alembic Migrations (from `Orbit-Backend/`)

```bash
alembic revision --autogenerate -m "description"   # Generate migration
alembic upgrade head                                # Apply all
alembic downgrade -1                                # Rollback last
```

After creating/modifying a model, import it in `alembic/env.py` (~line 37) before running autogenerate. Never use `Base.metadata.create_all()` — always use Alembic.

## Key Architecture Decisions

### Backend

- **Async everywhere:** All handlers, DB ops, and services use async/await. Database URLs auto-convert from `postgresql://` to `postgresql+asyncpg://` in `app/core/database.py`.
- **SQLAlchemy 2.0 syntax:** Models use `Mapped` type hints, `mapped_column()`, and inherit from `Base` (a `DeclarativeBase` in `app/core/database.py`).
- **Dependency injection:** Use `Depends(get_db)` for sessions, `Depends(get_current_user)` for auth (implemented in `app/api/deps.py`).
- **Ownership verification:** Every endpoint accessing user resources must filter by `user_id == current_user.id`. Never use bare `db.get(Model, id)` for user-owned data — always include ownership in the query `where` clause.
- **Config:** `app/core/config.py` uses Pydantic Settings loading from `app/.env` (DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY, DEBUG). Global singleton: `settings`.
- **Auth:** JWT (HS256) signed with SECRET_KEY, 30-min expiry. Passwords hashed with bcrypt. OAuth2 token URL: `auth/login`.
- **CORS:** Allows `http://localhost:5173` only. Must update for production.

### Frontend

- **TypeScript strict mode** with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`.
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (not PostCSS).
- **TanStack Query** for server state, React hooks for local state.

## What's Implemented

### Core Infrastructure
- `app/core/config.py` — Pydantic Settings (env loading)
- `app/core/database.py` — Async engine, session factory, `Base`, `get_db()` dependency
- `app/core/security.py` — Password hashing (bcrypt), JWT creation/validation, OAuth2 scheme
- `app/main.py` — FastAPI app with CORS, lifespan, health endpoints (`/`, `/health`, `/health/db`)

### Authentication System (Phase 1 Complete)
- `app/models/user.py` — User model (UUID pk, email unique+indexed, hashed_password, full_name, timestamps)
- `app/schemas/user.py` — UserCreate, UserResponse, Token, TokenData (with user_id from JWT "sub" claim)
- `app/api/deps.py` — `get_current_user()` dependency for protected endpoints
- `app/api/auth.py` — Three working endpoints:
  - `POST /auth/register` — User registration with email validation
  - `POST /auth/login` — Login returning JWT token (30-min expiry)
  - `GET /auth/me` — Get current authenticated user (protected)

### Database
- `alembic/` — Async migrations configured. Applied: `97569930fbf9_create_users_table`
- **Existing table:** `users` (UUID id, email unique+indexed, hashed_password, full_name, created_at, updated_at)

## What's NOT Implemented

- **Project/Task System:** Project, Task, Subtask models/schemas/endpoints
- **AI Integration:** Service layer for Claude API calls (task enhancement, smart suggestions)
- **Frontend:** All React pages and components (still default Vite template)

## Planned Features

**Database hierarchy:** `projects` → `tasks` → `subtasks`, all with `user_id` FKs. The User model has commented-out relationship definitions ready to uncomment when those models are created.

## Documentation

- `Orbit Development Kickstart Plan.md` — 8-phase implementation guide
- `Product Requirement Document V1.md` — Feature specs, personas, roadmap (MVP through Phase 3)
