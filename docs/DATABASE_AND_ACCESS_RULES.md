# Database Model and Authorization Rules

## 1. Tables

### User
- `id`: primary key
- `name`: required
- `email`: required, unique
- `password_hash`: required; never expose through API or send to AI
- `role`: enum/string constrained to `ADMIN`, `MANAGER`, `AGENT`
- `specialization`: nullable text
- `skills`: JSON/list of strings, or normalized relation if needed

### Project
- `id`: primary key
- `name`: required
- `client_name`: required
- `description`: text
- `manager_id`: foreign key to `User.id`; referenced user must have role `MANAGER`
- `deadline`: date

### Task
- `id`: primary key
- `project_id`: foreign key to `Project.id`
- `title`: required
- `description`: text
- `assignee_id`: foreign key to `User.id`; referenced user must have role `AGENT`
- `deadline`: date
- `estimated_hours`: positive numeric value

Relationships:
- One manager can manage many projects.
- One project has many tasks.
- One agent can own many tasks across projects.

## 2. Authorization matrix

| Action | ADMIN | MANAGER | AGENT |
|---|---|---|---|
| List projects | All | Own managed projects | Projects containing own tasks |
| View project | Any | Own managed projects only | Related project only |
| View tasks in project | All tasks | All tasks in own project | Own tasks only |
| List tasks | All | Tasks in own projects | Own tasks only |
| View team directory | Authenticated, per documented policy | Authenticated, per documented policy | Authenticated, per documented policy |
| Create from transcript | Yes | No | No |

Only ADMIN can create projects/tasks through transcript conversion. There is no requirement for general project/task editing or deletion.

## 3. Enforcement requirements

- Derive current user from a verified session/token.
- Never trust a `role`, `user_id`, or `manager_id` supplied by the browser to determine permissions.
- Apply authorization in every backend query or service operation, including direct object-ID requests.
- An agent must not receive other agents' task records even when viewing a related project.
- A manager may see all tasks only inside projects they manage.
- Check manager/agent role validity when validating AI output and before persistence.
- Consider returning `404` for unauthorized resource IDs to reduce resource enumeration.

## 4. Seed behavior

- Seed the ten demo users before the demo.
- Upsert by unique email; running the seed multiple times must not create duplicates.
- Hash `Demo123!` before storing it.
- Use stable references `ADMIN`, `PM01`, `PM02`, `PM03`, `DEV01`…`DEV06`, or maintain a reliable reference-to-database-ID mapping.
- The AI receives only safe directory fields: ID/reference, name, role, specialization, skills.
