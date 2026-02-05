# Orbit Development Kickstart Plan

## Overview

Transform Orbit from boilerplate to a working AI-powered task management MVP through 8 structured phases over 6-8 weeks (10-15 hours/week).

**Strategy:** Build in vertical slices - complete each feature end-to-end (database → backend → frontend) before moving to the next.

## Current State

- **Frontend:** React 19 + Vite + TypeScript boilerplate with Tailwind v4, React Query, Axios, React Router installed but NOT configured
- **Backend:** FastAPI skeleton with CORS, only /health endpoint exists. Empty app/models/, app/schemas/, app/api/, app/services/, app/core/
- **Database:** PostgreSQL configured in .env but NO SQLAlchemy setup, NO models, NO migrations
- **Status:** Fresh boilerplate, zero features implemented

## Implementation Phases

### Phase 1: Foundation & Authentication (Weeks 1-2, ~20-25 hours)

**Goal:** Working auth system - users can register, login, and access protected routes.

#### Backend Tasks:

**1. Core Infrastructure (Days 1-2)**

Create `app/core/config.py`:
- Pydantic Settings class loading from .env
- Type-safe access to DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, ANTHROPIC_API_KEY

Create `app/core/database.py`:
- SQLAlchemy async engine with PostgreSQL connection
- SessionLocal factory for dependency injection
- Base declarative class for models
- Test connection before proceeding

Create `app/core/security.py`:
- Password hashing with bcrypt (hash_password, verify_password functions)
- JWT token creation (create_access_token function)
- JWT verification (decode_access_token function)
- OAuth2PasswordBearer scheme

**2. User Model & Migrations (Days 3-4)**

Initialize Alembic:
```bash
cd Orbit-Backend
alembic init alembic
```

Configure Alembic:
- Edit alembic.ini to use DATABASE_URL from config
- Edit alembic/env.py to import Base and models

Create `app/models/user.py`:
- Fields: id (UUID), email (unique, indexed), hashed_password, full_name, created_at, updated_at
- Use SQLAlchemy 2.0 declarative syntax

Create `app/schemas/user.py`:
- UserCreate (email, password, full_name)
- UserLogin (email, password)
- UserResponse (id, email, full_name, created_at) - exclude password
- Token (access_token, token_type)

Create migration:
```bash
alembic revision --autogenerate -m "create users table"
alembic upgrade head
```

Verify: Check PostgreSQL (pgAdmin or psql) that users table exists with correct schema.

**3. Authentication Endpoints (Days 5-6)**

Create `app/api/deps.py`:
- get_db() dependency - yields database session
- get_current_user() dependency - decodes JWT, fetches user, raises 401 if invalid
- These will be reused in ALL protected endpoints

Create `app/api/auth.py`:
- POST /auth/register - validates input, checks email not taken, hashes password, creates user, returns JWT token
- POST /auth/login - validates credentials, verifies password, returns JWT token
- GET /auth/me - returns current user info (uses get_current_user dependency)

Update `app/main.py`:
- Import and include auth router
- Add exception handlers for better error responses
- Verify CORS is configured for http://localhost:5173

Verify with curl:
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Login
TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r .access_token)

# Get current user
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Frontend Tasks:

**4. API Client Setup (Day 7)**

Create `src/lib/axios.ts`:
- Axios instance with baseURL: http://localhost:8000
- Request interceptor: adds Authorization header from localStorage
- Response interceptor: handles 401 errors (clear token, redirect to login)

Create `src/lib/queryClient.ts`:
- QueryClient configuration with defaults
- Error handling, retry logic

Create `src/types/index.ts`:
- TypeScript interfaces: User, LoginRequest, RegisterRequest, AuthResponse
- Keep in sync with backend schemas

**5. Auth Context & UI (Day 8)**

Update `src/main.tsx`:
- Wrap app with QueryClientProvider
- Wrap app with BrowserRouter

Create `src/contexts/AuthContext.tsx`:
- Manages auth state (user, token, loading)
- Functions: login(), register(), logout()
- Persist token to localStorage
- Check token validity on mount (call /auth/me)
- useAuth() hook for components

Create `src/pages/Login.tsx`:
- Email/password form using Tailwind CSS
- Call AuthContext.login() on submit
- Show error messages
- Link to Register page
- Redirect to /dashboard on success

Create `src/pages/Register.tsx`:
- Email/password/full_name form
- Call AuthContext.register() on submit
- Show validation errors
- Link to Login page
- Redirect to /dashboard on success

Create `src/pages/Dashboard.tsx`:
- Protected route - redirects to /login if not authenticated
- Shows "Welcome, {user.full_name}" to verify auth works
- Placeholder for future content (will add projects/tasks later)

Update `src/App.tsx`:
- React Router setup with routes:
  - / → redirect to /dashboard if logged in, else /login
  - /login → Login page
  - /register → Register page
  - /dashboard → Dashboard (protected)

**Milestone Verification:**
1. Start backend: `cd Orbit-Backend && python -m uvicorn app.main:app --reload`
2. Start frontend: `cd Orbit-Frontend && npm run dev`
3. Register new user → should redirect to dashboard
4. Logout → should redirect to login
5. Login with registered user → should see dashboard with name
6. Refresh page → should stay logged in
7. Open incognito → should require login

**Checkpoint:** Full authentication working! This is the foundation for all features.

---

### Phase 2: Projects CRUD (Week 3, ~12-15 hours)

**Goal:** Users can create, view, edit, and delete projects.

#### Backend (Days 9-11):

Create `app/models/project.py`:
- Fields: id (UUID), user_id (FK to users), name, description, status (enum: active/archived/completed), color, created_at, updated_at
- Relationship: user = relationship("User", back_populates="projects")

Update `app/models/user.py`:
- Add: projects = relationship("Project", back_populates="user")

Create `app/schemas/project.py`:
- ProjectCreate (name, description?, status, color)
- ProjectUpdate (all fields optional)
- ProjectResponse (all fields)

Create migration:
```bash
alembic revision --autogenerate -m "create projects table"
alembic upgrade head
```

Create `app/api/projects.py`:
- GET /projects → list current user's projects (use get_current_user dependency)
- POST /projects → create project (set user_id from current_user)
- GET /projects/{id} → get single project (verify project.user_id == current_user.id)
- PUT /projects/{id} → update project (verify ownership)
- DELETE /projects/{id} → delete project (verify ownership)

**Security:** Create helper function to verify project ownership, raise 404 if not found or not owned by user.

Update `app/main.py`:
- Include projects router

Verify with curl (all endpoints, check ownership isolation).

#### Frontend (Days 12-14):

Create `src/api/projects.ts`:
- useProjects() → React Query hook to fetch list
- useProject(id) → fetch single project
- useCreateProject() → mutation
- useUpdateProject() → mutation
- useDeleteProject() → mutation

Create `src/components/ProjectModal.tsx`:
- Modal using Headless UI Dialog
- Form: name (required), description (textarea), status (select), color (color picker)
- Handles both create and edit modes
- Loading states, error handling

Create `src/components/ProjectCard.tsx`:
- Shows project info with colored border/badge
- Edit button (opens ProjectModal)
- Delete button (with confirmation dialog)
- Click card → navigate to /projects/{id}

Create `src/pages/Projects.tsx`:
- Grid of ProjectCard components
- "New Project" button (opens ProjectModal in create mode)
- Empty state if no projects
- Loading skeleton while fetching

Create `src/pages/ProjectDetail.tsx`:
- Shows project info
- Placeholder for tasks (will implement in Phase 3)
- "Back to Projects" link

Update `src/App.tsx`:
- Add routes: /projects, /projects/{id}

Update `src/pages/Dashboard.tsx`:
- Show overview of projects (count, recent projects)
- "Go to Projects" button

**Milestone Verification:**
1. Create 3-4 projects with different colors/statuses
2. Edit project name
3. Delete project (with confirmation)
4. Refresh page → projects persist
5. Logout and login → projects still there
6. Create second user account → should NOT see first user's projects

**Checkpoint:** Working CRUD feature! Pattern established for future features.

---

### Phase 3: Tasks CRUD (Week 4, ~12-15 hours)

**Goal:** Users can create, view, edit, and delete tasks within projects.

**Note:** Building basic tasks WITHOUT AI first. AI enhancement comes in Phase 6.

#### Backend (Days 15-17):

Create `app/models/task.py`:
- Fields: id (UUID), user_id (FK), project_id (FK, nullable), title, description, priority (enum: low/medium/high), status (enum: todo/in_progress/done), due_date (nullable), tags (JSON array), raw_input (nullable, for AI), ai_enhanced (boolean, default False), completed_at (nullable), created_at, updated_at
- Relationships: user, project
- Index on user_id, project_id, status for fast queries

Update `app/models/user.py` and `app/models/project.py`:
- Add tasks relationships

Create `app/schemas/task.py`:
- TaskCreate (title, description?, project_id?, priority, status, due_date?, tags?)
- TaskUpdate (all optional)
- TaskResponse (all fields)
- TaskListResponse (subset for lists - exclude long descriptions)

Create migration:
```bash
alembic revision --autogenerate -m "create tasks table"
alembic upgrade head
```

Create `app/api/tasks.py`:
- GET /tasks → list with filters (project_id?, status?, priority?, search?)
- POST /tasks → create task (verify project ownership if project_id provided)
- GET /tasks/{id} → get single task (verify ownership)
- PUT /tasks/{id} → update task (verify ownership)
- DELETE /tasks/{id} → delete task (verify ownership)
- PATCH /tasks/{id}/status → quick status update

Update `app/main.py`:
- Include tasks router

Verify with curl (create, list, filter, update, delete).

#### Frontend (Days 18-21):

Create `src/api/tasks.ts`:
- useTasks(filters?) → fetch list with optional filters
- useTask(id) → fetch single task
- useCreateTask() → mutation
- useUpdateTask() → mutation
- useDeleteTask() → mutation

Create `src/components/TaskModal.tsx`:
- Form: title, description, project (dropdown), priority, status, due_date
- Tags input (simple comma-separated)
- Handles create/edit modes

Create `src/components/TaskCard.tsx`:
- Shows task info with priority badge, status badge
- Project name (if assigned)
- Due date with overdue indicator
- Quick actions: edit, delete, mark complete

Create `src/pages/Tasks.tsx`:
- List/grid of TaskCard components
- Filters: project dropdown, status dropdown, priority dropdown
- Search input (debounced)
- Sort options: due date, priority, created date
- "New Task" button

Update `src/pages/ProjectDetail.tsx`:
- Show tasks for this project (reuse TaskCard)
- "Add Task" button (pre-fills project_id)

Update `src/pages/Dashboard.tsx`:
- Show task stats (todo/in_progress/done counts)
- Upcoming tasks (due in next 7 days)
- Overdue tasks (critical alert)

Update `src/App.tsx`:
- Add route: /tasks

**Milestone Verification:**
1. Create tasks in different projects
2. Create tasks without project
3. Filter by project, status, priority
4. Sort by due date
5. Edit task status: todo → in_progress → done
6. Delete task
7. View project detail → only shows that project's tasks
8. Mark task complete → sets completed_at

**Checkpoint:** Fully functional task management system! Usable even without AI.

---

### Phase 4: UI Polish & UX (Week 5, ~10-12 hours)

**Goal:** Make the app pleasant to use with professional polish.

#### Days 22-28:

**Dashboard Improvements:**
- Show meaningful stats (task counts, project counts)
- Upcoming tasks widget
- Overdue tasks alert
- Recent projects
- Quick action buttons

**Visual Polish:**
- Define consistent Tailwind color palette
- Create reusable Button component (variants: primary, secondary, danger)
- Consistent form input styling
- Modal animations (enter/exit)
- Card hover effects
- Professional typography scale

**Empty States:**
- "Create your first project" when no projects
- "Add tasks to get started" when no tasks in project
- "No results found" for filters/search

**Loading States:**
- Skeleton loaders for lists
- Button spinners during mutations
- Optimistic updates (show change immediately, rollback on error)

**Error Handling:**
- Toast notifications (success/error)
- Inline validation errors on forms
- Network error banner
- Retry buttons for failed requests

**Mobile Responsiveness:**
- Test all pages on mobile viewport
- Hamburger navigation menu
- Touch-friendly buttons (44x44px minimum)
- Forms work on mobile keyboards

**Accessibility:**
- Keyboard navigation works throughout
- Proper ARIA labels
- Visible focus indicators
- Color contrast meets WCAG AA

**Milestone Verification:**
1. Test on mobile, tablet, desktop sizes
2. Navigate using only keyboard
3. Disconnect internet → verify error handling
4. Slow network (Chrome throttling) → verify loading states
5. Show to someone unfamiliar → watch them use it

**Checkpoint:** Professional, polished task manager ready for AI enhancement!

---

### Phase 5: AI Integration - Task Enhancement (Week 6, ~12-15 hours)

**Goal:** AI transforms rough task notes into structured tasks.

#### Backend (Days 29-31):

Create `app/services/ai_service.py`:
- AIService class with enhance_task(raw_input: str) method
- Uses httpx async client to call Anthropic API (claude-3-5-sonnet-20241022)
- Prompt engineering: "Analyze user input and provide structured task with title, description, priority, due_date, tags as JSON"
- Error handling: if API fails, return None (caller shows error)
- Response parsing: extract and validate JSON from AI response
- Simple caching: dict with (hash(raw_input) → (response, timestamp)) to prevent duplicate calls

Update `app/core/config.py`:
- Load ANTHROPIC_API_KEY from environment

Update `app/schemas/task.py`:
- TaskEnhancementRequest (raw_input: str)
- TaskEnhancementResponse (title, description, priority, due_date?, tags)

Update `app/api/tasks.py`:
- POST /tasks/enhance → calls AIService.enhance_task(), returns suggestions
- This is SEPARATE from task creation - user reviews before saving

Verify with curl:
```bash
# Test various inputs
curl -X POST http://localhost:8000/tasks/enhance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"raw_input":"need to update homepage asap"}'
```

Check that AI correctly:
- Extracts priority from urgency keywords
- Parses relative dates ("tomorrow", "next week")
- Generates relevant tags

#### Frontend (Days 32-35):

Create `src/api/ai.ts`:
- useEnhanceTask() → mutation calling /tasks/enhance

Create `src/components/AITaskModal.tsx`:
- **Step 1:** Large textarea: "What needs to be done?"
- Buttons: "Enhance with AI ✨" and "Skip AI"
- **Step 2 (after AI response):** Shows AI suggestions in editable form
- User can modify all fields
- Buttons: "Create Task" and "Start Over"
- Loading state during AI processing (~2-3 seconds)
- Error handling: if AI fails, fallback to manual form

Update task creation flow:
- "New Task" button now shows dropdown:
  - "Quick capture with AI" (opens AITaskModal)
  - "Manual entry" (opens regular TaskModal)

**User Flow:**
1. Click "New Task" → "Quick capture with AI"
2. Type: "prepare slides for presentation tmrw"
3. Click "Enhance with AI"
4. See AI suggestions:
   - Title: "Prepare presentation slides"
   - Priority: High
   - Due Date: Tomorrow's date
   - Tags: ["presentation", "slides"]
5. Edit if needed
6. Click "Create Task"

**Milestone Verification:**
1. Test with vague inputs → AI should clarify
2. Test with urgent keywords → AI should set high priority
3. Test with relative dates → AI should parse correctly
4. Edit AI suggestions before saving
5. Test "Skip AI" still works
6. Test API failure (disconnect internet) → shows error, offers manual entry
7. Show to someone → watch them use AI capture

**Checkpoint:** Your killer feature is working! AI-enhanced task capture.

---

### Phase 6: Subtasks (Week 7, ~12-15 hours)

**Goal:** Tasks can have subtasks, with AI-powered generation.

#### Backend (Days 36-38):

Create `app/models/subtask.py`:
- Fields: id (UUID), task_id (FK), title, completed (boolean), order_index (int), created_at
- Relationship: task = relationship("Task", back_populates="subtasks")

Update `app/models/task.py`:
- Add: subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")

Create migration:
```bash
alembic revision --autogenerate -m "create subtasks table"
alembic upgrade head
```

Create `app/schemas/subtask.py`:
- SubtaskCreate (title, order_index)
- SubtaskUpdate (title?, completed?, order_index?)
- SubtaskResponse (all fields)

Create `app/api/subtasks.py`:
- GET /tasks/{task_id}/subtasks → list subtasks
- POST /tasks/{task_id}/subtasks → create subtask (verify task ownership)
- PUT /subtasks/{id} → update subtask
- DELETE /subtasks/{id} → delete subtask
- PATCH /subtasks/{id}/toggle → toggle completed
- PUT /tasks/{task_id}/subtasks/reorder → update order_index for multiple

Update `app/services/ai_service.py`:
- Add generate_subtasks(task_title, task_description) method
- Prompt: "Break this task into 3-6 logical, actionable subtasks. Return JSON array of titles."
- Returns list of suggested subtask titles

Update `app/api/tasks.py`:
- POST /tasks/{task_id}/subtasks/generate → calls AI to suggest subtasks
- Returns array of suggestions (user must explicitly accept)

Update `app/main.py`:
- Include subtasks router

#### Frontend (Days 39-42):

Create `src/api/subtasks.ts`:
- useSubtasks(taskId)
- useCreateSubtask()
- useUpdateSubtask()
- useDeleteSubtask()
- useToggleSubtask()
- useReorderSubtasks()
- useGenerateSubtasks() → mutation

Create `src/components/SubtaskList.tsx`:
- Shows list of subtasks for a task
- Each subtask: checkbox (toggle complete), inline-editable title, delete button
- Drag handles for reordering (use @dnd-kit or react-beautiful-dnd)
- "Add subtask" button
- "Generate subtasks with AI ✨" button

Create `src/components/SubtaskGenerateModal.tsx`:
- Shows AI-generated suggestions
- Each suggestion has checkbox (all checked by default)
- User can uncheck ones they don't want
- "Add selected subtasks" button

Update `src/components/TaskModal.tsx`:
- Add subtask section (only for existing tasks, not during creation)
- Or: show SubtaskList inside TaskCard/TaskDetail view

Update `src/components/TaskCard.tsx`:
- Show subtask progress: "3/5 completed" with progress bar

**Milestone Verification:**
1. Create task, manually add 3 subtasks
2. Toggle subtask completion
3. Reorder by dragging
4. Delete subtask
5. Edit subtask title inline
6. Click "Generate subtasks" on complex task → AI suggests steps
7. Generate subtasks, uncheck one → only checked ones created
8. Verify progress bar updates correctly

**Checkpoint:** Complete task breakdown feature with AI assistance!

---

### Phase 7: Search & Performance (Week 8, Days 43-46, ~6-8 hours)

**Goal:** Fast, efficient app with search functionality.

#### Backend:

Update `app/api/tasks.py`:
- Add search parameter (full-text search using PostgreSQL ILIKE on title + description)
- Add pagination: limit=50, offset=0
- Response includes: items[], total, page, pages

Add database indexes:
- tasks.user_id, tasks.project_id, tasks.status, tasks.created_at
- projects.user_id, projects.created_at

#### Frontend:

Create `src/components/SearchBar.tsx`:
- Debounced input (wait 300ms after typing stops)
- Clear button
- Loading indicator

Update `src/pages/Tasks.tsx`:
- Add SearchBar component
- Implement infinite scroll or "Load more" button for pagination

React Query optimization:
- Configure cache times (staleTime, cacheTime)
- Prefetch on hover (e.g., hover project → prefetch tasks)
- Proper query invalidation on mutations

**Verification:**
1. Search for tasks by keyword
2. Test with 50+ tasks (pagination works)
3. Verify fast response times (<500ms excluding AI)

---

### Phase 8: Testing & Documentation (Week 8, Days 47-52, ~4-6 hours)

**Goal:** Production-ready with documentation.

#### Testing:

**Manual testing checklist:**
- [ ] Register, login, logout
- [ ] Create/edit/delete projects
- [ ] Create/edit/delete tasks
- [ ] Create/edit/delete subtasks
- [ ] AI task enhancement
- [ ] AI subtask generation
- [ ] Search and filters
- [ ] Mobile responsiveness
- [ ] Error handling (network errors, API failures)
- [ ] Multi-user isolation (different users can't see each other's data)

**Backend tests (optional but recommended):**
- pytest for critical auth flows
- Test ownership verification
- Mock AI service

#### Documentation:

Update README.md:
- Project description
- Features list with screenshots
- Tech stack
- Installation instructions (prerequisites, setup steps)
- Running locally (commands for frontend and backend)
- Environment variables needed

Add screenshots to README:
- Login page
- Dashboard
- Projects view
- Task creation with AI
- Task detail with subtasks

API Documentation:
- FastAPI auto-generates at /docs
- Add docstrings to endpoints with examples

#### Deployment Preparation:

Create deployment checklist:
- [ ] CORS configured for production domain
- [ ] Environment variables set correctly
- [ ] Database connection pooling enabled
- [ ] HTTPS enabled
- [ ] Health check endpoint works (/health)
- [ ] Error logging setup (consider Sentry)
- [ ] Rate limiting on AI endpoints
- [ ] Backup strategy for database

**Recommended deployment platforms (free tiers):**
- Backend: Render.com, Railway.app, or Fly.io
- Frontend: Vercel or Netlify
- Database: Render PostgreSQL or Supabase

**Checkpoint:** Production-ready MVP complete! 🚀

---

## Critical Files to Create (in order)

### First 5 Files (Foundation):

1. **c:\Users\Afnan Farid\Documents\Orbit\Orbit-Backend\app\core\config.py**
   - Pydantic Settings for environment variables
   - Every other module depends on this

2. **c:\Users\Afnan Farid\Documents\Orbit\Orbit-Backend\app\core\database.py**
   - SQLAlchemy engine, session factory, Base class
   - Required before any models

3. **c:\Users\Afnan Farid\Documents\Orbit\Orbit-Backend\app\core\security.py**
   - Password hashing, JWT creation/verification
   - Used by auth endpoints

4. **c:\Users\Afnan Farid\Documents\Orbit\Orbit-Backend\app\models\user.py**
   - First database model
   - Required for auth

5. **c:\Users\Afnan Farid\Documents\Orbit\Orbit-Frontend\src\lib\axios.ts**
   - API client with auth interceptors
   - Every frontend API call depends on this

6. **c:\Users\Afnan Farid\Documents\Orbit\Orbit-Backend\app\api\deps.py**
   - get_db() and get_current_user() dependencies
   - Reused in every protected endpoint

---

## Verification Strategy

**After each phase:**
1. Backend: Test with curl/Postman before building frontend
2. Frontend: Test in browser before moving on
3. Integration: Test full user flow end-to-end
4. Edge cases: Bad data, network failures, etc.
5. Multi-user: Login as different users, verify data isolation

---

## Timeline & Effort

| Week | Phase | Deliverable | Hours |
|------|-------|-------------|-------|
| 1-2 | Foundation + Auth | Auth working, first API call | 20-25 |
| 3 | Projects CRUD | Projects feature complete | 12-15 |
| 4 | Tasks CRUD | Usable task manager | 12-15 |
| 5 | UI Polish | Professional UX | 10-12 |
| 6 | AI - Tasks | AI task enhancement | 12-15 |
| 7 | Subtasks | AI subtask generation | 12-15 |
| 8 | Search + Polish | Production-ready | 8-12 |

**Total: 86-109 hours (6-8 weeks at 10-15 hours/week)**

---

## Key Architectural Patterns

### Backend Pattern: Separation of Concerns
- `models/` → Database schema (SQLAlchemy ORM)
- `schemas/` → API contracts (Pydantic validation)
- `api/` → HTTP endpoints (FastAPI routers)
- `services/` → Business logic (AI, complex operations)
- `core/` → Cross-cutting (auth, config, database)

### Frontend Pattern: Feature-Based
- `pages/` → Route components
- `components/` → Reusable UI
- `api/` → React Query hooks
- `contexts/` → Global state (auth)
- `lib/` → Utilities (axios config)
- `types/` → TypeScript interfaces

### Security Pattern: Defense in Depth
- JWT authentication
- Ownership verification on EVERY endpoint
- Pydantic input validation
- Password hashing (never store plaintext)
- CORS properly configured
- Rate limiting on AI endpoints

### AI Integration Pattern: Graceful Degradation
- AI is enhancement, NOT requirement
- Always provide manual alternative
- User reviews AI output before saving
- Error handling with fallbacks
- Caching to reduce API calls and costs

---

## Success Criteria

**Technical Success:**
- [ ] All tables exist with proper relationships
- [ ] All CRUD operations work correctly
- [ ] Authentication secure and persistent
- [ ] AI task enhancement works 90%+ of time
- [ ] No console errors
- [ ] API response times <500ms (excluding AI)
- [ ] Mobile responsive

**User Success:**
- [ ] A friend can use without guidance
- [ ] AI capture faster than manual entry
- [ ] App is pleasant to use
- [ ] Data persists correctly

**Portfolio Success:**
- [ ] Clean, readable code
- [ ] Good README with screenshots
- [ ] Deployed and accessible via URL
- [ ] Demonstrates full-stack + AI skills

---

## What We're Skipping (Phase 2 Features)

These are in the PRD but NOT in MVP:
- Kanban board view
- Calendar view
- Meeting notes → tasks
- Pattern learning (requires historical data)
- Team collaboration
- Voice-to-task
- Advanced analytics
- Email notifications
- Mobile apps (responsive web is enough)

Add these AFTER MVP is deployed and tested.

---

## Cost Estimate

**Development:** Free (local PostgreSQL, VS Code, open source tools)

**Production (Free tier):**
- Backend hosting: Free
- Frontend hosting: Free
- Database: Free (with limits)
- Anthropic API: ~$1-3/month for personal use
  - Typical task enhancement: ~200 input + 150 output tokens = $0.003
  - 1000 AI enhancements/month ≈ $3

---

## Daily Development Routine

**Starting a feature:**
1. Read relevant section of this plan
2. Start with backend (models → schemas → endpoints)
3. Test backend with curl
4. Build frontend (API hooks → UI)
5. Test full flow in browser
6. Commit with descriptive message

**Getting stuck:**
1. Take a break (15 min)
2. Read error messages carefully
3. Check docs (FastAPI, React Query)
4. Skip and move on if blocked >1 hour

**Ending a session:**
1. Commit your work (even if incomplete)
2. Write down next steps
3. Test that app still runs

---

## Next Immediate Step

After plan approval, start with **Phase 1, Task 1**:

Create `app/core/config.py` with Pydantic Settings class loading environment variables from .env file.
