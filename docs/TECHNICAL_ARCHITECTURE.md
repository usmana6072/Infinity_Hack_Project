# Technical Architecture

## 1. Recommended stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios (or native `fetch`, but choose one consistently)

### Backend
- Python
- FastAPI
- Pydantic for request/response and AI-output validation
- SQLAlchemy ORM
- Alembic only if time allows; for a hackathon, a controlled table-creation step is acceptable
- Password hashing with a maintained password-hashing library
- JWT bearer authentication or secure cookie sessions; choose one and use it consistently

### Database
- PostgreSQL for hosted deployment
- SQLite is acceptable for the fastest local demo if PostgreSQL setup threatens delivery. Keep SQLAlchemy models portable.

### AI
- An LLM API that can return structured JSON / schema-constrained output.
- Keep provider-specific code isolated in `ai_service.py`.

## 2. High-level architecture

Browser (React) → REST API (FastAPI) → service layer → SQLAlchemy → database

The transcript endpoint also calls the LLM provider:
FastAPI → AI provider → structured draft → Pydantic/domain validation → database transaction.

The browser must never call the LLM provider directly. Keep API keys on the backend.

## 3. Suggested repository structure

```text
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── context/
│   │   ├── services/api.js
│   │   ├── types/                 # optional if using TypeScript
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── projects.py
│   │   │   ├── tasks.py
│   │   │   └── transcript.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── seed.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   └── task.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   └── transcript.py
│   │   └── services/
│   │       ├── ai_service.py
│   │       ├── auth_service.py
│   │       └── project_service.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
└── README.md
```

## 4. Design rules

- Keep routers thin; put business logic in services.
- Keep provider-specific LLM code behind one service function.
- Use Pydantic schemas at API boundaries.
- Use database foreign keys for project-manager and task-assignee relationships.
- Use a transaction for creating the complete transcript result.
- Use one consistent date format: ISO `YYYY-MM-DD`.
- Use one consistent role vocabulary: `ADMIN`, `MANAGER`, `AGENT`.
- Use stable demo references (`ADMIN`, `PM01`…`DEV06`) in AI output, then map them to database user IDs.
- Configure CORS for the actual frontend origin; do not use permissive production CORS.
- Do not add extra frameworks or services unless a concrete requirement needs them.
