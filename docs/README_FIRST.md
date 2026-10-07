# NovaWorks AI Project Manager — AI Build Guide

Read these documents in this order before writing code:

1. `PRODUCT_REQUIREMENTS.md` — what to build and what not to build.
2. `TECHNICAL_ARCHITECTURE.md` — stack, boundaries, and folder structure.
3. `API_CONTRACT.md` — frontend/backend agreement. Treat this as the source of truth.
4. `DATABASE_AND_ACCESS_RULES.md` — schema, roles, and authorization rules.
5. `AI_TRANSCRIPT_PIPELINE.md` — AI extraction, validation, and safe persistence.
6. `UI_UX_SPEC.md` — screens and expected behavior.
7. `IMPLEMENTATION_PLAN.md` — recommended build order for a three-hour hackathon.
8. `ACCEPTANCE_TESTS.md` — definition of done and judging scenarios.
9. `AI_CODING_INSTRUCTIONS.md` — instructions for the coding agent.
10. `.env.example` — environment-variable names only; replace placeholders locally.

## Non-negotiable rules

- Build the actual transcript-to-record flow. Do not hardcode the expected projects/tasks as the result of AI processing.
- Seed the ten supplied demo accounts; no signup flow.
- Enforce authorization on the backend for every protected read/write.
- Use the final decisions in the meeting transcript, not superseded suggestions.
- Validate the complete AI result before saving anything.
- Save all projects and tasks in one database transaction.
- Keep secrets out of source control. Never commit `.env`, API keys, or database credentials.
- Prefer a small, working MVP over extra features.
