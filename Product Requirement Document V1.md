# ORBIT
## AI-Powered Project Management Application

**Product Requirements Document**  
Version 1.0  
February 4, 2026

**Tech Stack:** React + TypeScript | Tailwind CSS | FastAPI | PostgreSQL

---

# Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Goals](#product-vision--goals)
3. [User Persona & Stories](#user-persona--stories)
4. [Feature Breakdown](#feature-breakdown)
5. [Technical Architecture](#technical-architecture)
6. [Database Schema](#database-schema)
7. [AI Integration Strategy](#ai-integration-strategy)
8. [Development Roadmap](#development-roadmap)
9. [Success Metrics](#success-metrics)
10. [Appendix: Resources](#appendix-resources-for-beginners)

---

# Executive Summary

Orbit is an AI-powered project management application designed to solve a critical problem: **the loss of task details between initial capture and formal documentation**. When tasks arrive via WhatsApp, verbal instructions, or quick meetings, important nuances often get forgotten by the time they're properly logged.

Unlike traditional project management tools, Orbit leverages AI to enhance task capture, intelligently structure information, and provide predictive insights. The core differentiator is allowing users to quickly dump rough task notes, which AI then refines into structured, actionable items with suggested priorities, deadlines, and subtasks.

## Key Highlights

- **Primary User:** Corporate professionals managing multiple concurrent projects
- **Core Innovation:** AI-enhanced task capture that prevents information loss
- **Tech Stack:** React + TypeScript, Tailwind CSS, FastAPI, PostgreSQL
- **Target Launch:** MVP as side project / portfolio piece with potential commercialization
- **Competitive Advantage:** AI/LLM integration for smart task management

---

# Product Vision & Goals

## Vision Statement

> *"Orbit transforms how busy professionals capture and manage work by making AI the bridge between chaotic input and structured execution."*

## Primary Goals

1. **Capture tasks instantly** without friction - from rough notes to structured tasks in seconds
2. **Preserve critical details** that are typically lost when tasks arrive informally
3. **Reduce cognitive load** by letting AI handle task structuring and organization
4. **Provide intelligent insights** on workload, priorities, and realistic timelines
5. **Scale gracefully** from personal use to potential team/commercial product

---

# User Persona & Stories

## Primary Persona

| **Attribute** | **Details** |
|---------------|-------------|
| **Name** | Alex Chen |
| **Role** | Senior UI/UX Designer & Frontend Developer |
| **Experience** | 3-5 years in corporate environment, managing 3-5 concurrent projects |
| **Pain Points** | • Tasks arrive via WhatsApp, Slack, verbal instructions - hard to capture properly<br>• Forgets important details by the time task is formally documented<br>• Struggles to prioritize when everything feels urgent<br>• Existing tools are either too simple or overwhelming |
| **Goals** | • Quickly capture tasks without losing context<br>• Stay organized across multiple projects<br>• Get help with prioritization and time management |

## Key User Stories

- *As Alex,* I want to quickly jot down task notes from a WhatsApp message so that I don't lose important details when I'm busy.
- *As Alex,* I want AI to clean up my rough notes and suggest proper task structure so that I don't have to think about formatting when I'm in a rush.
- *As Alex,* I want to see all my projects organized by urgency so that I can focus on what matters most.
- *As Alex,* I want AI to break down complex tasks into subtasks so that I have a clear action plan.
- *As Alex,* I want realistic deadline suggestions based on task complexity so that I stop overcommitting.

---

# Feature Breakdown

## Phase 1: MVP (3-6 months)

*Focus: Core functionality with AI-enhanced task capture*

### 1.1 Core Task Management

- **Task CRUD operations** (Create, Read, Update, Delete)
- **Task properties:** Title, Description, Priority (High/Medium/Low), Status (To Do/In Progress/Done), Due Date, Project Assignment
- **Quick capture interface:** Simple text input for rapid task entry
- **Task list views:** All tasks, By project, By priority, By due date

### 1.2 Project Organization

- **Project CRUD operations**
- **Project properties:** Name, Description, Status, Color coding
- **Task-to-project assignment**
- **Project dashboard:** Overview of all projects with task counts

### 1.3 AI-Enhanced Task Capture (MVP Killer Feature)

- **Smart task enhancement:** User inputs rough notes, AI (Claude/GPT API) generates:
  - Clear, professional task title
  - Structured description with key details
  - Suggested tags/categories
  - Extracted deadline if mentioned in notes
- **User review & edit:** All AI suggestions are editable before saving
- **Auto-prioritization:** AI analyzes keywords (urgent, ASAP, when possible) and suggests priority level

### 1.4 Smart Task Breakdown

- **Subtask generation:** AI detects complex tasks and suggests logical subtasks
- **User control:** Accept all, edit, or reject AI suggestions
- **Subtask management:** Checkbox completion, reordering, manual addition

### 1.5 User Interface

- **Dashboard:** Overview of all projects and urgent tasks
- **Task views:** List view (default MVP), Kanban board view (stretch goal)
- **Filtering & sorting:** By project, priority, status, due date
- **Search functionality:** Full-text search across tasks and projects
- **Responsive design:** Mobile-friendly Tailwind CSS components

### 1.6 Authentication

- **User registration & login:** Email/password authentication
- **Session management:** JWT tokens for secure API access
- **User profile:** Basic settings and preferences

---

## Phase 2: Enhanced Intelligence (6-12 months)

*Focus: Pattern learning and context-aware features*

### 2.1 Pattern Learning & Predictions

- **Habit analysis:** AI learns how long tasks typically take based on completion history
- **Smart deadline suggestions:** Realistic time estimates based on task type and user patterns
- **Workload warnings:** AI alerts when schedule is overloaded

### 2.2 Context Awareness

- **Smart prioritization:** AI considers overall workload when suggesting priorities
- **Conflict detection:** Warns about overlapping deadlines
- **Reprioritization suggestions:** AI recommends adjustments based on capacity

### 2.3 Meeting Notes → Tasks

- **Text upload:** Paste meeting notes or upload .txt file
- **Action item extraction:** AI identifies and creates tasks from meeting content
- **Batch import:** Review and edit all extracted tasks before saving

### 2.4 Enhanced UI

- **Calendar view:** Visualize tasks by due date
- **Timeline view:** Project progress tracking
- **Analytics dashboard:** Task completion rates, time tracking insights

---

## Phase 3: Advanced Features (12+ months)

*Focus: Voice integration and predictive analytics*

### 3.1 Voice-to-Task

- **Real-time transcription:** Record voice notes and convert to text
- **Meeting recording:** Longer recordings with automatic task extraction
- **Voice commands:** Quick task creation via voice

### 3.2 Predictive Analytics

- **Delay predictions:** ML models predict project delays based on completion patterns
- **Capacity planning:** AI suggests optimal workload distribution
- **Performance insights:** Identify productivity patterns and bottlenecks

### 3.3 Team Collaboration (If Scaling)

- Multi-user workspaces
- Task assignment and delegation
- Comments and collaboration features
- Permission management

---

# Technical Architecture

## System Overview

Orbit follows a modern three-tier architecture with a React frontend, FastAPI backend, and PostgreSQL database. AI functionality is provided via external API calls to Claude/GPT models.

## Tech Stack Details

### Frontend
**React 18+ with TypeScript**
- Vite for fast development & builds
- React Router for navigation
- React Query for state management & caching
- Axios for API calls

### Styling
**Tailwind CSS 3+**
- Custom design system configuration
- Headless UI for accessible components
- Heroicons for iconography

### Backend
**Python 3.11+ with FastAPI**
- Pydantic for data validation
- SQLAlchemy 2.0 for ORM
- Alembic for database migrations
- Python-jose for JWT handling
- Passlib for password hashing

### Database
**PostgreSQL 15+**
- PgAdmin 4 for database management
- Full-text search capabilities
- JSON support for flexible data

### AI Integration
**Anthropic Claude API or OpenAI GPT API**
- HTTPX for async API calls
- Rate limiting & error handling
- Response caching to reduce costs

### Development Tools
- Git for version control
- ESLint & Prettier for code quality
- Pytest for backend testing
- React Testing Library for frontend tests

## Architecture Flow

1. User interacts with React frontend (browser)
2. Frontend sends HTTP requests to FastAPI backend
3. Backend authenticates requests via JWT tokens
4. Backend queries PostgreSQL for data (via SQLAlchemy ORM)
5. For AI features, backend calls Claude/GPT API asynchronously
6. AI responses are processed and returned to frontend
7. Frontend displays results with real-time updates

---

# Database Schema

## Core Tables

### users

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique, not null |
| hashed_password | VARCHAR(255) | Bcrypt hashed |
| full_name | VARCHAR(255) | Optional |
| created_at | TIMESTAMP | Default: now() |
| updated_at | TIMESTAMP | Auto-update trigger |

### projects

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to users.id |
| name | VARCHAR(255) | Not null |
| description | TEXT | Optional |
| status | ENUM | active, archived, completed |
| color | VARCHAR(7) | Hex color code |
| created_at | TIMESTAMP | Default: now() |
| updated_at | TIMESTAMP | Auto-update trigger |

### tasks

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to users.id |
| project_id | UUID | FK to projects.id, optional |
| title | VARCHAR(500) | Not null |
| description | TEXT | Optional |
| priority | ENUM | low, medium, high |
| status | ENUM | todo, in_progress, done |
| due_date | DATE | Optional |
| tags | JSON | Array of tag strings |
| raw_input | TEXT | Original user input before AI enhancement |
| ai_enhanced | BOOLEAN | Flag if AI was used |
| completed_at | TIMESTAMP | Optional, set when status = done |
| created_at | TIMESTAMP | Default: now() |
| updated_at | TIMESTAMP | Auto-update trigger |

### subtasks

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| task_id | UUID | FK to tasks.id |
| title | VARCHAR(500) | Not null |
| completed | BOOLEAN | Default: false |
| order_index | INTEGER | For ordering subtasks |
| created_at | TIMESTAMP | Default: now() |

## Relationships

- One user → Many projects (1:N)
- One user → Many tasks (1:N)
- One project → Many tasks (1:N)
- One task → Many subtasks (1:N)

---

# AI Integration Strategy

## API Selection: Claude vs GPT

| Factor | Claude | GPT |
|--------|--------|-----|
| **Cost** | Similar pricing, slightly cheaper | Industry standard |
| **Output Quality** | Excellent at following instructions | Excellent, more creative |
| **Ease of Use** | Simpler API, good docs | More features, complex |
| **Recommendation** | ✓ **Best for MVP** | Good alternative |

**Recommendation:** Start with **Claude API (claude-3-5-sonnet-20241022)** for MVP. It's beginner-friendly and perfect for structured task enhancement.

## Implementation Details

### 1. Backend AI Service (FastAPI)

Create a dedicated AI service module:
- **File:** `app/services/ai_service.py`
- **Functions:** `enhance_task()`, `suggest_priority()`, `break_into_subtasks()`
- **Error handling:** Fallback to original text if API fails
- **Rate limiting:** Implement caching for similar requests

### 2. Prompt Engineering

Well-crafted prompts are critical for consistent results.

**Example - Task Enhancement Prompt:**

```
You are an AI assistant helping to structure tasks for a project management app. 
The user has input rough task notes. Your job is to:

- Create a clear, concise task title (max 80 characters)
- Write a structured description with key details
- Extract any mentioned deadline
- Suggest 2-4 relevant tags
- Return as JSON: {title, description, due_date, tags}
```

### 3. Cost Management

- **Use smaller models** (Claude Haiku, GPT-3.5) for simple tasks
- **Cache responses** for similar inputs (Redis recommended for Phase 2)
- **Rate limiting** per user to prevent abuse
- **Estimated cost:** ~$0.50-2/month for personal use, $10-50/month for 100 users

### 4. Frontend Integration

- Show loading state while AI processes
- Display AI suggestions in editable preview modal
- Allow users to accept, edit, or reject AI output
- Provide option to skip AI and create task manually

---

# Development Roadmap

## Phase 1: MVP (Months 1-6)

### Month 1-2: Foundation

- **Week 1-2:** Project setup, database design, authentication
- **Week 3-4:** Basic CRUD for projects
- **Week 5-6:** Basic CRUD for tasks
- **Week 7-8:** Basic UI with Tailwind, responsive design

### Month 3-4: AI Integration

- **Week 9-10:** Set up AI API, create service layer
- **Week 11-12:** Implement task enhancement feature
- **Week 13-14:** Auto-prioritization & subtask generation
- **Week 15-16:** Frontend integration & UX refinement

### Month 5-6: Polish & Testing

- **Week 17-18:** Filtering, search, sorting features
- **Week 19-20:** Performance optimization, caching
- **Week 21-22:** Bug fixes, user testing
- **Week 23-24:** Documentation, portfolio preparation

## Phase 2: Enhanced Intelligence (Months 7-12)

- Pattern learning & predictions
- Context-aware features
- Meeting notes → tasks
- Calendar & timeline views
- Analytics dashboard

## Phase 3: Advanced Features (Months 13+)

- Voice-to-task capabilities
- Predictive analytics & ML models
- Team collaboration (if scaling)
- Mobile apps (iOS/Android)

---

# Success Metrics

## MVP Launch Criteria

- ✅ **Functional:** Users can create, edit, delete projects and tasks
- ✅ **AI Core:** Task enhancement works 90%+ of the time
- ✅ **Performance:** AI responses within 3 seconds
- ✅ **UX:** Mobile responsive, intuitive navigation
- ✅ **Security:** Authentication works, data is user-specific

## Key Performance Indicators (KPIs)

| Metric | MVP Target | Phase 2 Target |
|--------|-----------|----------------|
| **AI Enhancement Usage** | 80% of new tasks | 90% of new tasks |
| **Task Completion Rate** | 60% | 75% |
| **Time Saved per Task** | 2-3 minutes | 5+ minutes |
| **AI Response Time** | < 3 seconds | < 2 seconds |
| **User Satisfaction** | Personal use success | 4.5/5 rating |

---

# Appendix: Resources for Beginners

## Learning Resources

### Frontend (React + TypeScript + Tailwind)

- React official docs: [react.dev](https://react.dev)
- TypeScript handbook: [typescriptlang.org](https://typescriptlang.org)
- Tailwind CSS docs: [tailwindcss.com](https://tailwindcss.com)
- React Query docs: [tanstack.com/query](https://tanstack.com/query)

### Backend (Python + FastAPI)

- FastAPI tutorial: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- SQLAlchemy docs: [sqlalchemy.org](https://sqlalchemy.org)
- Pydantic docs: [pydantic-docs.helpmanual.io](https://pydantic-docs.helpmanual.io)

### AI Integration

- Anthropic Claude docs: [docs.anthropic.com](https://docs.anthropic.com)
- OpenAI API docs: [platform.openai.com/docs](https://platform.openai.com/docs)
- Prompt engineering guide: [promptingguide.ai](https://promptingguide.ai)

## Next Steps

1. **Review this document** and confirm you're comfortable with the scope
2. **Set up development environment** (VS Code, Node, Python, PostgreSQL)
3. **Create project repository** on GitHub
4. **Start with database schema** (Week 1 priority)
5. **Build authentication first** (foundation for everything else)

---

# 🚀 Good luck with Orbit!

> *Remember: Start small, iterate often, and let AI be your co-pilot.*
