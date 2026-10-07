# Acceptance Tests / Definition of Done

## Authentication
- [ ] Each of the ten seeded accounts can log in with its configured demo credentials.
- [ ] Invalid credentials return a safe error.
- [ ] Passwords are hashed in the database.
- [ ] API identity/role comes from the verified token/session, not client-supplied fields.
- [ ] Logout behavior matches the chosen auth strategy.

## Transcript conversion
- [ ] Empty transcript is rejected.
- [ ] Only ADMIN can call the endpoint.
- [ ] The backend supplies the current team directory to the AI.
- [ ] Passwords and password hashes are never sent to the AI.
- [ ] Supplied transcript produces 3 projects and 12 tasks.
- [ ] UrbanCart deadline is 2026-10-20.
- [ ] UrbanCart integration deadline is 2026-10-19.
- [ ] QuickServe integration is 10 hours and due 2026-10-22.
- [ ] HelpDeskPro evaluation/testing is assigned to Maryam.
- [ ] No task is created for payment gateway, inventory integration, live maps, driver tracking, or external email integration.
- [ ] Kamran is not created as an employee or assignee.
- [ ] A modified transcript can change the corresponding output rather than returning a fixed canned answer.
- [ ] Invalid AI output creates zero records.
- [ ] A database failure rolls back the entire batch.
- [ ] Repeated clicks are prevented while processing; duplicate protection is used if feasible.

## Authorization
- [ ] Admin can list all projects and tasks.
- [ ] Ayesha sees only UrbanCart.
- [ ] Bilal sees only QuickServe.
- [ ] Hina sees only HelpDeskPro.
- [ ] Ali sees only his three tasks.
- [ ] Hamza sees his two tasks across UrbanCart and QuickServe.
- [ ] An agent viewing a related project cannot see other agents' tasks.
- [ ] Direct requests for unauthorized project IDs are denied.
- [ ] Non-admin transcript creation is denied.

## Persistence and UX
- [ ] Projects/tasks remain after refresh and server restart.
- [ ] UI has loading, success, empty, and error states where relevant.
- [ ] Unauthorized data is not fetched and merely hidden in the browser.
- [ ] Demo can be run using documented commands.
- [ ] `.env.example` contains variable names and placeholders, not real secrets.
- [ ] README explains setup, seed, demo logins, and transcript test.
