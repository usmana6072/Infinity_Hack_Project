# Instructions for the AI Coding Agent

You are implementing the NovaWorks AI Project Manager hackathon MVP. Follow the documents in this folder as requirements.

## Before making changes
1. Inspect the existing repository and identify what is already implemented.
2. Read `PRODUCT_REQUIREMENTS.md`, `TECHNICAL_ARCHITECTURE.md`, `API_CONTRACT.md`, `DATABASE_AND_ACCESS_RULES.md`, `AI_TRANSCRIPT_PIPELINE.md`, and `ACCEPTANCE_TESTS.md`.
3. Summarize the planned implementation and identify any contract conflicts before editing files.
4. Preserve existing working code unless a change is required.

## Implementation principles
- Build only the required MVP; do not add unrequested features.
- Follow `API_CONTRACT.md` exactly. If a change is essential, update the contract and both sides together.
- Use clear, small modules and descriptive names.
- Never hardcode the expected projects/tasks as the transcript endpoint's answer.
- Seed demo users idempotently and hash passwords.
- Keep AI provider credentials and database credentials in environment variables.
- Never expose secrets to the frontend or send user passwords to the AI.
- Validate AI output server-side, including references, roles, dates, and positive hours.
- Persist a transcript batch atomically.
- Enforce role-based access in backend queries and direct-object endpoints.
- Add useful loading/error states and safe error messages.
- Keep frontend and backend field naming consistent.
- Include setup/run/seed commands in README.
- Include `.env.example` with placeholders and ensure `.env` is ignored by Git.

## Required working behavior
- Login with seeded accounts.
- Admin-only transcript conversion.
- Three projects and twelve tasks from the supplied transcript.
- Manager and agent views filtered by backend authorization.
- Persistent data.
- Modified-transcript test proves the AI flow is genuine.

## Validation before declaring complete
- Run available backend tests and frontend build.
- Exercise the acceptance tests.
- Report what works, what was tested, and any limitations honestly.
- Do not claim a feature is complete if it is stubbed or uses a canned response.
