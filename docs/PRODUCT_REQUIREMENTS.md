# Product Requirements Document (PRD)
## NovaWorks AI Project Manager — Meeting to Execution

**Challenge:** THE INFINITY HACK ’26 — AI Project Manager  
**Company scenario:** NovaWorks Technologies, Lahore, Pakistan  
**Build constraint:** 4 participants, 3 hours  
**Product type:** Small role-based project-management CRM with AI transcript conversion

## 1. Product goal

Let an administrator paste a meeting transcript and have the application extract and save projects, project managers, tasks, task owners, deadlines, and estimated developer hours. Users then see only the projects/tasks permitted for their role.

The central workflow is:

Login → paste transcript → AI creates structured draft → validate → save projects/tasks → view role-specific CRM screens.

## 2. Users and roles

- **Administrator (ADMIN):** sees all projects, can view the team directory, and can create projects/tasks from a transcript.
- **Project manager (MANAGER):** sees projects assigned to them and the tasks belonging to those projects.
- **Developer/agent (AGENT):** sees only tasks assigned to them and limited details of the related project.

The supplied demo has 1 administrator, 3 managers, and 6 agents. Seed these accounts before the demo. Do not build registration, password reset, email verification, or user-management screens.

## 3. Required features

### Authentication
- Login with the supplied demo email and password.
- Logout.
- Determine identity and role from a trusted server-side session/token, never from a role or user ID supplied by the client.
- Store password hashes, not plaintext passwords.

### Admin experience
- Dashboard with all projects.
- Read-only team directory.
- Transcript input and “Create from Transcript” action.
- Loading, success, and understandable error states.
- Show created project/task counts and allow the admin to open the resulting projects.

### Project and task views
- Project list.
- Project details: project name, client, description, manager, deadline, and authorized tasks.
- Task rows: title, description, assignee, deadline, and estimated hours.
- Manager view filtered to projects managed by the logged-in manager.
- Agent “My Tasks” view filtered to tasks assigned to the logged-in agent.
- Data persists after refresh.

### AI transcript conversion
- Use the entire transcript as input.
- Supply the AI with the existing team directory (IDs, names, roles, skills); never send passwords or password hashes.
- Extract only projects and tasks supported by the meeting.
- Resolve later corrections over earlier suggestions.
- Exclude explicitly rejected features.
- Match assignees/managers to existing users.
- Validate all required fields and references before saving.
- If required information is unresolved, show a clear correction/error path and save nothing.
- Prevent duplicate submissions while a request is processing.

## 4. Explicitly out of scope

Do not build:
- Signup, forgot password, email verification, user-management CRUD.
- Cost/budget calculations, hourly rates, timesheets, progress monitoring, completion percentages, or charts.
- Payment processing, inventory integration, live maps, driver tracking, or external email/ticketing integrations for the sample projects.
- Microservices, Kubernetes, or elaborate real-time features.

## 5. Demo data and expected transcript result

Seed these ten fictional demo accounts. All use the demo password `Demo123!` unless the team documents a changed password.

| Ref | Name | Email | Role | Specialization / skills |
|---|---|---|---|---|
| ADMIN | Admin | admin@novaworks.example | ADMIN | Company overview, transcript creation |
| PM01 | Ayesha Khan | ayesha@novaworks.example | MANAGER | Web PM; web projects, client coordination |
| PM02 | Bilal Ahmed | bilal@novaworks.example | MANAGER | Mobile PM; mobile projects, delivery planning |
| PM03 | Hina Malik | hina@novaworks.example | MANAGER | AI PM; AI projects, requirement review |
| DEV01 | Ali Raza | ali@novaworks.example | AGENT | Full-Stack; React, frontend integration |
| DEV02 | Hamza Shah | hamza@novaworks.example | AGENT | Full-Stack; Node.js, databases, APIs |
| DEV03 | Sara Noor | sara@novaworks.example | AGENT | App Developer; Flutter, mobile UI |
| DEV04 | Usman Tariq | usman@novaworks.example | AGENT | App Developer; Flutter, integration, testing |
| DEV05 | Zain Abbas | zain@novaworks.example | AGENT | AI Developer; LLMs, extraction, prompts |
| DEV06 | Maryam Asif | maryam@novaworks.example | AGENT | AI Developer; retrieval, document processing |

Use stable IDs corresponding to the references above, or maintain a deterministic mapping from these references to database IDs. Seed idempotently (upsert by email); rerunning the seed must not duplicate users.

### Expected projects

| Project | Client | Manager | Deadline | Tasks | Total estimated hours |
|---|---|---|---|---:|---:|
| UrbanCart Website | UrbanCart Clothing | Ayesha Khan (PM01) | 2026-10-20 | 4 | 40 |
| QuickServe Mobile App | QuickServe Services | Bilal Ahmed (PM02) | 2026-10-24 | 4 | 46 |
| HelpDeskPro AI Assistant | HelpDeskPro Solutions | Hina Malik (PM03) | 2026-10-22 | 4 | 38 |

### Expected tasks

| Project | Task | Assignee | Deadline | Hours |
|---|---|---|---|---:|
| UrbanCart Website | Product catalog UI | Ali Raza (DEV01) | 2026-10-12 | 12 |
| UrbanCart Website | Demo cart UI | Ali Raza (DEV01) | 2026-10-15 | 8 |
| UrbanCart Website | Product and cart APIs | Hamza Shah (DEV02) | 2026-10-14 | 14 |
| UrbanCart Website | Website integration and testing | Ali Raza (DEV01) | 2026-10-19 | 6 |
| QuickServe Mobile App | Login and profile screens | Sara Noor (DEV03) | 2026-10-12 | 8 |
| QuickServe Mobile App | Service booking screens | Sara Noor (DEV03) | 2026-10-17 | 12 |
| QuickServe Mobile App | Booking and account APIs | Hamza Shah (DEV02) | 2026-10-16 | 16 |
| QuickServe Mobile App | Mobile integration and testing | Usman Tariq (DEV04) | 2026-10-22 | 10 |
| HelpDeskPro AI Assistant | FAQ document processing | Maryam Asif (DEV06) | 2026-10-13 | 10 |
| HelpDeskPro AI Assistant | Assistant answer generation | Zain Abbas (DEV05) | 2026-10-17 | 14 |
| HelpDeskPro AI Assistant | Human escalation flow | Zain Abbas (DEV05) | 2026-10-18 | 6 |
| HelpDeskPro AI Assistant | Assistant evaluation and testing | Maryam Asif (DEV06) | 2026-10-21 | 8 |

## 6. Important transcript decisions

The transcript contains earlier proposals followed by final decisions. Use the final decisions:

- UrbanCart project deadline is **20 October 2026**, not 18 October.
- UrbanCart integration task deadline is **19 October 2026**, not 17 October.
- QuickServe integration estimate is **10 hours**, not 8.
- HelpDeskPro evaluation/testing is assigned to **Maryam**, not Zain.
- Kamran is not a NovaWorks employee; do not add or assign him.
- Do not create tasks for rejected payment gateway, inventory integration, live maps, driver tracking, payment integration, or external email/ticketing.
- Keep the three client engagements as three separate projects.
- Estimated hours represent effort, not elapsed calendar days.
- Do not create management-hour estimates.

## 7. Success criteria

A successful MVP allows the judges to:
1. Log in as admin without signup.
2. Submit the supplied transcript and see genuine AI processing.
3. Save exactly 3 projects and 12 tasks for the supplied transcript.
4. Inspect project and task details.
5. Log in as Ayesha and see only UrbanCart.
6. Log in as Ali and see only Ali’s three tasks.
7. Log in as Hamza and see his two tasks across two projects.
8. Attempt unauthorized direct API access and be denied.
9. Refresh and see saved data persist.
10. Submit a modified transcript and observe the relevant generated value change.
