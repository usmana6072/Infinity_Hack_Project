# API Contract — Frontend/Backend Source of Truth

Base path: `/api`. JSON request/response bodies unless stated otherwise. Use the authenticated identity from the token/session. The client must not be allowed to choose its effective role or identity.

## Authentication

### `POST /api/auth/login`
Request:
```json
{ "email": "admin@novaworks.example", "password": "Demo123!" }
```
Success response (example):
```json
{
  "access_token": "<token>",
  "token_type": "bearer",
  "user": {
    "id": "ADMIN",
    "name": "Admin",
    "email": "admin@novaworks.example",
    "role": "ADMIN"
  }
}
```
Return `401` for invalid credentials. Never return password hashes.

### `GET /api/auth/me`
Requires authentication. Returns the current user's safe public fields: `id`, `name`, `email`, `role`, `specialization`, `skills`.

### `POST /api/auth/logout`
If using stateless JWT, document that client logout clears the token; if using revocable sessions/cookies, invalidate the session. Do not pretend a stateless token has been revoked unless it has.

## Team

### `GET /api/users/team`
Requires authentication. Returns read-only team directory fields only. Never include password or password hash. If the challenge interpretation permits only admin access, restrict it to admin; otherwise authenticated users may read the directory. Pick and document one policy.

Response:
```json
{
  "users": [
    {
      "id": "PM01",
      "name": "Ayesha Khan",
      "role": "MANAGER",
      "specialization": "Web PM",
      "skills": ["Web projects", "client coordination"]
    }
  ]
}
```

## Projects

### `GET /api/projects`
- ADMIN: all projects.
- MANAGER: projects where `manager_id` is the current user.
- AGENT: distinct projects that contain at least one task assigned to the current user.

Response:
```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "UrbanCart Website",
      "clientName": "UrbanCart Clothing",
      "description": "Responsive demo storefront...",
      "manager": { "id": "PM01", "name": "Ayesha Khan" },
      "deadline": "2026-10-20",
      "taskCount": 4
    }
  ]
}
```

### `GET /api/projects/{project_id}`
- ADMIN: may read any existing project and its tasks.
- MANAGER: may read only a project they manage; include all tasks in that project.
- AGENT: may read a project only if assigned to at least one task in it; include only their own tasks. They may see the related project name and manager, but never other agents' tasks.
- Return `404` for nonexistent or unauthorized project IDs if you want to avoid leaking resource existence; be consistent.

## Tasks

### `GET /api/tasks`
Return tasks according to the same role policy:
- ADMIN: all tasks.
- MANAGER: tasks in projects they manage.
- AGENT: only tasks assigned to them.

### `GET /api/tasks/my`
Convenience endpoint for the current agent's assigned tasks. For non-agent roles, either return their role-appropriate tasks or return `403`; choose one behavior and document it. Recommended: allow all roles and apply role filtering consistently.

## Transcript

### `POST /api/transcript/create`
Admin only. Request:
```json
{ "transcript": "Full meeting transcript text..." }
```

Success response:
```json
{
  "message": "Projects and tasks created successfully.",
  "projectsCreated": 3,
  "tasksCreated": 12,
  "projects": [
    { "id": "project-id", "name": "UrbanCart Website", "taskCount": 4 }
  ]
}
```

Possible errors:
- `401`: unauthenticated.
- `403`: authenticated but not ADMIN.
- `422`: empty transcript, malformed AI output, unknown employee, invalid date/hours, or other validation issue. Include a safe, user-readable message and field-level details where practical.
- `502` or `503`: AI provider failed or returned unusable output.
- `409`: duplicate-submission protection detects a repeated operation, if implemented.

All-or-nothing rule: on any validation or persistence failure, create zero projects and zero tasks.

## Shared data conventions

- Dates are ISO `YYYY-MM-DD`.
- Estimated hours are positive numbers.
- IDs in API responses are database IDs or stable demo IDs, but the same choice must be used consistently.
- Use camelCase JSON fields at the API boundary if that is easiest for the React frontend; Python internals may use snake_case.
- Return safe, predictable error shapes. Do not expose stack traces, secrets, prompts containing sensitive information, or provider credentials.
