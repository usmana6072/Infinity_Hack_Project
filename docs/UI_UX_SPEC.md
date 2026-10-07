# UI/UX Specification

## Overall design
Build a clean, modern, responsive internal SaaS dashboard. Prioritize clarity and fast implementation over complex animation. Use consistent spacing, typography, colors, cards, tables, badges, and empty/loading/error states.

## Shared shell
- Sidebar or compact navigation.
- Top bar with current user name/role and logout.
- Main content area.
- Responsive layout usable on a laptop at hackathon judging.

## Screen 1: Login
- Email input.
- Password input.
- Login button.
- Clear invalid-credentials message.
- Optional quick-fill demo account selector is acceptable, but do not expose secrets beyond the supplied demo credentials.
- No signup/forgot-password links.

## Screen 2: Admin dashboard
- Summary cards: project count and task count are useful but optional.
- Project cards/list showing project name, client, manager, deadline, task count.
- Primary “Create from Transcript” action.
- Team directory entry.

## Screen 3: Create from Transcript
- Large multiline text area.
- Submit button.
- Loading state and disabled button during processing.
- On success: show number of projects/tasks created and links/cards for created projects.
- On failure: clear error and correction guidance; do not show raw stack traces.
- Do not display fabricated success while processing.

## Screen 4: Team directory
- Read-only list of name, role, specialization, and skills.
- Never display passwords or hashes.

## Screen 5: Projects list
- Display only projects returned by the authorized API.
- Project cards show name, client, manager, deadline, and task count.
- Useful empty state when no projects are assigned.

## Screen 6: Project details
- Project name, client, description, manager, deadline.
- Task list with title, description, assignee, deadline, estimated hours.
- For agents, render only tasks returned by the backend; never fetch all tasks and filter only in the browser.

## Screen 7: My Tasks
- Agent sees assigned tasks across projects.
- Show task title, project, deadline, estimated hours, and description.
- Empty state if no assigned tasks.

## Role-aware navigation
- Admin: Dashboard, Projects, Team, Create from Transcript.
- Manager: My Projects.
- Agent: My Tasks, and related project details as authorized.
- Frontend route guards improve UX but are not a security boundary. Backend authorization is mandatory.
