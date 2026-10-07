# AI Transcript Pipeline

## 1. Required flow

1. Authenticate request.
2. Reject unless current user role is `ADMIN`.
3. Validate that transcript is non-empty and within a sensible maximum length.
4. Load the current team directory from the database.
5. Send the full transcript and safe team directory to the LLM.
6. Request only the agreed JSON shape.
7. Parse the response and validate it with Pydantic.
8. Validate business rules and references.
9. If anything is invalid or unresolved, return a clear error and save nothing.
10. In one database transaction, insert all projects and their tasks.
11. Commit only after every insert succeeds.
12. Return created project/task counts and project summaries.

## 2. AI output schema

The AI should return JSON only, in this conceptual shape:

```json
{
  "projects": [
    {
      "name": "Project name",
      "clientName": "Client name",
      "description": "Scope and exclusions",
      "managerRef": "PM01",
      "deadline": "2026-10-20",
      "tasks": [
        {
          "title": "Task title",
          "description": "Task scope",
          "assigneeRef": "DEV01",
          "deadline": "2026-10-12",
          "estimatedHours": 12
        }
      ]
    }
  ]
}
```

Use `managerRef` and `assigneeRef` as stable references to seeded team members. Map those references to actual database user IDs in application code. Do not let the AI invent database primary keys.

## 3. Validation rules

- `projects` must be a non-empty list.
- Required project fields: name, client, manager reference, valid deadline.
- Manager reference must resolve to an existing user with role `MANAGER`.
- Each project must have at least one task for this challenge.
- Required task fields: title, assignee reference, valid deadline, positive estimated hours.
- Assignee reference must resolve to an existing user with role `AGENT`.
- Task deadline must not be later than its project deadline.
- Dates must be valid ISO dates.
- Hours must be numeric and greater than zero.
- Reject unknown people; never silently create a user.
- Reject malformed or incomplete output.
- For the supplied transcript, expected result is exactly 3 projects and 12 tasks.
- Do not enforce exactly 3/12 for every possible transcript; modified transcripts should be able to produce different valid output.

## 4. Corrections and exclusions

The prompt should instruct the model to:
- Prefer final explicit decisions over earlier tentative proposals.
- Treat “replace”, “instead”, “accepted”, “final”, “confirmed”, and similar language as revision signals.
- Exclude explicitly rejected features.
- Keep separate client projects separate.
- Use only the supplied team directory.
- Distinguish development tasks from features mentioned in the client's product.
- Avoid creating tasks for hypothetical future work.
- Treat estimated hours as effort, not calendar duration.
- Never infer a person who is not in the directory.

## 5. Suggested system/developer prompt for the LLM

You are a meeting-to-project extraction engine for NovaWorks Technologies.

Convert the supplied meeting transcript into a structured project/task draft that conforms exactly to the provided schema. Use only the supplied team directory for project managers and task assignees.

Rules:
1. Read the entire transcript before deciding.
2. Final agreed decisions override earlier proposals, estimates, owners, or dates.
3. Include only agreed current-scope projects and development tasks.
4. Exclude rejected, deferred, hypothetical, or explicitly out-of-scope features.
5. Keep distinct client engagements as separate projects.
6. Match manager and assignee references exactly to directory entries. Never invent employees or IDs.
7. Use ISO dates (`YYYY-MM-DD`) and positive numeric effort estimates.
8. Task deadlines must not exceed their project deadline.
9. Do not estimate management hours.
10. Do not include commentary, Markdown fences, or fields outside the requested schema.
11. If required information cannot be resolved, return a structured validation issue if the chosen provider/schema supports it; otherwise return a clear error object that the backend recognizes. Do not guess.

Transcript:
{{TRANSCRIPT}}

Team directory:
{{TEAM_DIRECTORY}}

Return the schema:
{{JSON_SCHEMA}}

## 6. Persistence safety

- Validate the entire result before opening the write transaction.
- Insert projects and tasks within one transaction.
- Roll back all writes if any insert fails.
- Disable the submit button while processing.
- Consider an idempotency/request key or duplicate-submit guard.
- Do not claim success until the transaction commits.
- Never treat a prefilled sample response as proof of AI processing.
