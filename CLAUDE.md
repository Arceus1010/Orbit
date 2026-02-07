# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Orbit** is an AI-powered project management app that uses Claude to transform rough task notes into structured, actionable items with smart prioritization, deadlines, and subtask suggestions.

**Status:** Phase 1 Complete — Backend authentication system and frontend API client are fully implemented and tested. Ready for Phase 2 (UI pages).

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
- **TanStack Query** for server state with configured `QueryClient` (1-min stale time, 5-min cache).
- **Axios instance** with request/response interceptors for automatic JWT token management.
- **5-layer architecture:** Component → Hook → Service → Axios → Backend.

## What's Implemented

### Core Infrastructure
- `app/core/config.py` — Pydantic Settings (env loading)
- `app/core/database.py` — Async engine, session factory, `Base`, `get_db()` dependency
- `app/core/security.py` — Password hashing (bcrypt), JWT creation/validation, OAuth2 scheme
- `app/main.py` — FastAPI app with CORS, lifespan, health endpoints (`/`, `/health`, `/health/db`)

### Backend Authentication System (Phase 1 Complete)
- `app/models/user.py` — User model (UUID pk, email unique+indexed, hashed_password, full_name nullable, timestamps)
  - **Important:** Timestamps use `datetime.utcnow()` (timezone-naive) to match PostgreSQL `TIMESTAMP WITHOUT TIME ZONE`
- `app/schemas/user.py` — UserCreate (full_name optional), UserResponse, Token, TokenData
- `app/api/deps.py` — `get_current_user()` dependency for protected endpoints
- `app/api/auth.py` — Three working endpoints:
  - `POST /auth/register` — User registration with email validation (full_name optional)
  - `POST /auth/login` — Login returning JWT token (30-min expiry)
  - `GET /auth/me` — Get current authenticated user (protected)

### Frontend API Client (Phase 1 Complete)
- `src/lib/axios.ts` — Configured Axios instance with request/response interceptors for automatic JWT token management
- `src/lib/queryClient.ts` — TanStack Query configuration with cache settings and query keys
- `src/types/auth.ts` — TypeScript types mirroring backend Pydantic schemas
- `src/services/authService.ts` — API service functions (register, login, getCurrentUser, logout, token management)
- `src/hooks/useAuth.ts` — React hooks (useRegister, useLogin, useCurrentUser, useLogout, useIsAuthenticated)
- `src/components/AuthDemo.tsx` — Demo component showing complete auth flow (for testing)
- **Documentation:** `API_CLIENT_GUIDE.md`, `ARCHITECTURE_FLOW.md`, `TESTING_CHECKLIST.md`, `README_API_CLIENT.md`

### Database
- `alembic/` — Async migrations configured
- **Applied migrations:**
  - `97569930fbf9_create_users_table` — Initial users table
  - `d5ed1ebb5248_make_full_name_nullable` — Made full_name nullable
- **Current table:** `users` (UUID id, email unique+indexed, hashed_password, full_name nullable, created_at, updated_at)

## What's NOT Implemented

- **Project/Task System:** Project, Task, Subtask models/schemas/endpoints
- **AI Integration:** Service layer for Claude API calls (task enhancement, smart suggestions)
- **Frontend UI Pages:** Login/Register pages, Dashboard, Project/Task views (App.tsx still using default Vite template)

## Planned Features

**Database hierarchy:** `projects` → `tasks` → `subtasks`, all with `user_id` FKs. The User model has commented-out relationship definitions ready to uncomment when those models are created.

## Known Issues & Solutions

### Windows Console Emoji Encoding
- **Issue:** Backend startup fails with `UnicodeEncodeError` when printing emojis in Windows console (cp1252 encoding)
- **Solution:** Use UTF-8 capable terminal (VS Code integrated terminal, Windows Terminal) or temporarily remove emojis from `app/main.py` lines 25-39

### Timestamp Timezone Handling
- **Important:** SQLAlchemy models must use `datetime.utcnow()` (not `datetime.now(timezone.utc)`) to match PostgreSQL `TIMESTAMP WITHOUT TIME ZONE` columns
- **Error if using timezone-aware:** `can't subtract offset-naive and offset-aware datetimes`

## Documentation

- `Orbit Development Kickstart Plan.md` — 8-phase implementation guide
- `Product Requirement Document V1.md` — Feature specs, personas, roadmap (MVP through Phase 3)
- `Orbit-Frontend/API_CLIENT_GUIDE.md` — Comprehensive guide to frontend API client architecture
- `Orbit-Frontend/ARCHITECTURE_FLOW.md` — Visual diagrams of data flow and layer interactions
- `Orbit-Frontend/TESTING_CHECKLIST.md` — Step-by-step testing guide for API client
- `Orbit-Frontend/README_API_CLIENT.md` — Quick start guide for frontend developers
