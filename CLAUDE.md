# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Orbit** is an AI-powered project management app that uses Claude to transform rough task notes into structured, actionable items with smart prioritization, deadlines, and subtask suggestions.

**Status:** Phase 1 Complete — Backend auth system and frontend auth UI (Login, Register, Dashboard, protected routes) are implemented. Phase 2 (Project/Task system) is next.

## Architecture

```
[React Frontend]  ←→  [FastAPI Backend]  ←→  [PostgreSQL]
   :5173                  :8000                 :5432
                             ↓
                     [Anthropic Claude API]
```

- **Frontend:** React 19 + TypeScript (strict) + Vite 7 + Tailwind CSS 4 (Vite plugin) + shadcn/ui + TanStack Query + Axios + React Router DOM + Lucide Icons
- **Backend:** FastAPI (async) + SQLAlchemy 2.0 (async with asyncpg) + Pydantic 2 + Alembic + python-jose (JWT) + Passlib (bcrypt) + email-validator + HTTPX

## Development Commands

### Frontend (`Orbit-Frontend/`)

```bash
npm run dev       # Dev server at localhost:5173
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
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

- **TypeScript strict mode** with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`.
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin (not PostCSS). Configured in `vite.config.ts`, not `postcss.config.js`.
- **Feature-based architecture:** Frontend is organized by feature domain, not by file type. Each feature contains its own components, hooks, service, types, and utils. Shared code lives in `src/shared/`.
- **shadcn/ui** (New York style, Neutral base color) with CSS variable theming. Components live in `src/shared/ui/` and are added via `npx shadcn@latest add <component>`. Uses Radix UI primitives, `class-variance-authority`, `clsx`, `tailwind-merge`, and Lucide icons.
- **Dark mode** via class-based toggling (`.dark` on `<html>`). ThemeProvider in `src/shared/components/ThemeProvider.tsx` manages light/dark/system modes with localStorage persistence (`orbit-ui-theme` key). Use `useTheme()` from `src/shared/hooks/useTheme.ts` to access theme state. FOUC prevention script in `index.html`.
- **Path aliases:** `@/` maps to `src/` (configured in `tsconfig.app.json` and `vite.config.ts`). Use `@/` imports for shared code and cross-feature imports.
- **Semantic color tokens:** Use `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, etc. instead of hardcoded colors like `bg-gray-50` or `text-indigo-600`. All tokens are defined as CSS variables in `src/index.css`.
- **TanStack Query** for server state with configured `QueryClient` (1-min stale time, 5-min cache). Query keys defined in `src/shared/lib/query-client.ts`.
- **Axios instance** (`src/shared/lib/axios.ts`) with request/response interceptors for automatic JWT token management (localStorage). Token helpers in `src/shared/lib/token.ts`.
- **Feature pattern:** Each feature (e.g., `features/auth/`) contains: `*.types.ts`, `*.service.ts`, `*.hooks.ts`, `*.utils.ts`, page components, and feature-specific sub-components in `components/`. New features should follow this pattern.
- **Routing:** React Router DOM configured in `App.tsx` with `ProtectedRoute` wrapper component that checks auth state and redirects to `/login` if unauthenticated.

## Current Implementation State

### What Exists
- **Auth system (backend):** Register (`POST /auth/register`), login (`POST /auth/login`), get-current-user (`GET /auth/me`) endpoints in `app/api/auth.py`
- **Auth feature (frontend):** `src/features/auth/` — LoginPage, RegisterPage, NotFoundPage, auth hooks, service, types, utils, PasswordInput and PasswordRequirements components
- **Dashboard feature (frontend):** `src/features/dashboard/` — DashboardPage with ModeToggle
- **Shared (frontend):** `src/shared/` — UI primitives (shadcn/ui), ThemeProvider, ModeToggle, LoadingScreen, ProtectedRoute, axios client, token management, query client, utils
- **Database:** `users` table (UUID pk, email unique+indexed, hashed_password, full_name nullable, timestamps) managed via Alembic migrations
- **Core infra:** Config, async DB engine, security utilities (JWT + bcrypt), health endpoints, CORS, global exception handlers

### What's NOT Implemented
- **Project/Task System:** Models, schemas, and endpoints for projects → tasks → subtasks hierarchy (all with `user_id` FKs). Query keys for projects/tasks are pre-defined in `src/shared/lib/query-client.ts`.
- **AI Integration:** Service layer for Claude API calls (task enhancement, smart suggestions). ANTHROPIC_API_KEY is in config but no service exists yet.
- **Frontend Project/Task views:** Dashboard currently shows a welcome message only. No project or task management UI.

## Known Issues

### Timestamp Timezone Handling
SQLAlchemy models must use `datetime.utcnow()` (not `datetime.now(timezone.utc)`) to match PostgreSQL `TIMESTAMP WITHOUT TIME ZONE` columns. Mixing naive and aware datetimes causes `can't subtract offset-naive and offset-aware datetimes`.
