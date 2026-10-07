# Three-Hour Implementation Plan

## Before coding (10 minutes)
- Both teammates read `README_FIRST.md`, `API_CONTRACT.md`, and `DATABASE_AND_ACCESS_RULES.md`.
- Agree on field names, auth method, base URL, and error format.
- Create `.env.example` files and `.gitignore`.
- One person owns frontend; one owns backend. Integrate against the contract, not assumptions.

## Backend-first milestones

### 0–25 minutes: foundation
- Create FastAPI app and health endpoint.
- Configure database connection.
- Create User, Project, Task models.
- Create tables.
- Add idempotent seed script.

### 25–50 minutes: authentication and access
- Login and `/auth/me`.
- Password hashing.
- Auth dependency.
- Role-filtered project/task query functions.
- Test direct unauthorized project/task requests.

### 50–75 minutes: core read APIs
- Team directory.
- Project list/detail.
- Task list/my tasks.
- Confirm API response matches `API_CONTRACT.md`.

### 75–120 minutes: AI pipeline
- Implement provider call.
- Parse structured output.
- Pydantic and business validation.
- One-transaction persistence.
- Test corrections and rejected features.

### 120–165 minutes: frontend
- Login.
- Role-aware shell.
- Projects/dashboard.
- Project details and task list.
- Transcript submission and success/error states.

### 165–180 minutes: integration and demo
- Seed clean demo data.
- Run all acceptance tests.
- Record a backup demo video if possible.
- Verify README commands and environment variables.

## Parallel work rules
- Backend teammate publishes the exact API contract before endpoint implementation.
- Frontend teammate uses a small API client module and does not hardcode project/task results.
- Use a shared `.env.example`; never share actual secrets in Git.
- Integrate early with a health endpoint and login, not at the end.
- Avoid changing response shapes without notifying the other teammate.

## Cut order if behind schedule
1. Keep login, backend authorization, transcript-to-record flow, and persistence.
2. Keep project/task list and detail views.
3. Simplify visual polish and dashboard metrics.
4. Drop optional editing, charts, animations, and deployment if necessary.
