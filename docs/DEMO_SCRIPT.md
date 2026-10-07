# Judge Demo Script

1. Start the database/backend/frontend using the README commands.
2. Run the seed command. Confirm it can be rerun without duplicate users.
3. Log in as `admin@novaworks.example`.
4. Paste the full supplied meeting transcript and click **Create from Transcript**.
5. Show loading state, then the result: 3 projects and 12 tasks.
6. Open each project and show client, manager, deadline, tasks, assignees, dates, and hours.
7. Log out; log in as `ayesha@novaworks.example`. Show only UrbanCart.
8. Log out; log in as `ali@novaworks.example`. Show Ali's three tasks only.
9. Log in as `hamza@novaworks.example`. Show his two tasks across UrbanCart and QuickServe.
10. Demonstrate that a direct unauthorized API request is denied.
11. Refresh and show records persist.
12. Change QuickServe integration estimate in a copy of the transcript to 12 hours and its deadline to 23 October. Submit in a clean database or use a safe test setup; show the AI reflects the changed values.
13. Explain that signup, budgets, progress tracking, and rejected client features are intentionally out of scope.
