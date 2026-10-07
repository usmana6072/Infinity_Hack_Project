import os
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_connection, init_db
from app.db.seed import seed_users

# Transcript from docs/mockUI/app.js
SAMPLE_TRANSCRIPT = """Meeting: NovaWorks Client Delivery Planning
Date: 7 October 2026 | Scheduled duration: 60 minutes
Participants: Ayesha, Bilal, Hina, Ali, Hamza, Sara, Usman, Zain, Maryam

09:00-09:04 | Opening and company workflow
Ayesha: Good morning. We have three client engagements to plan today: UrbanCart Clothing's website, QuickServe's customer mobile app, and HelpDeskPro's AI support assistant. Please keep these as three separate projects. A combined project would make client reporting confusing.
Bilal: We should finish with a project manager, deadline, task owner, and estimated hours for every piece of work. The estimate is effort, not the number of days between start and end.
Hina: Agreed. And each task must belong to a single owner from our team. If someone needs help, they still have one primary owner.

09:04-09:08 | UrbanCart scope and manager
Ayesha: Let's start with UrbanCart Clothing. This is a responsive website to browse products, view details, and use a demo cart. No payment gateway or inventory integration for this phase. The client explicitly pushed payments to a future contract, so keep payment processing out of this scope.
Bilal: Who is managing UrbanCart?
Ayesha: I will manage UrbanCart Website.
Bilal: Noted. What is the delivery deadline?
Ayesha: Tentatively 18 October, but let's confirm after reviewing the tasks.

09:08-09:12 | UrbanCart frontend tasks
Ali: I can take the frontend work. Product catalog UI will take 12 hours, due 12 October. That covers product listing, the detail screen, and responsive layout.
Ayesha: Good. And the demo cart?
Ali: Demo cart UI will be 8 hours, due 15 October. That includes adding/removing items, quantities, and a visible total. We don't need checkout processing or payment forms.
Ayesha: Agreed: catalog UI 12 hours on 12 October; cart UI 8 hours on 15 October. Both owned by Ali.

09:12-09:16 | UrbanCart backend and delivery correction
Hamza: For Product and cart APIs, I estimate 14 hours. I own it, and the deadline is 14 October. I will provide product responses and the demo cart endpoints Ali needs.
Ayesha: Good. After that, Ali owns Website integration and testing. Let's start with a six-hour estimate and a 17 October deadline.
Ali: Six hours is reasonable for connecting the screens and checking the demo flow. But please move that task to 19 October. I need a little more calendar space after the API work.
Ayesha: Accepted. Website integration and testing is 6 hours, due 19 October. Also, the client has just confirmed that final project delivery can be 20 October. That replaces the earlier 18 October date. The final UrbanCart project deadline is 20 October.
Hamza: So the final website plan has four tasks, and the new deadline is 20 October. No payment gateway in this phase.
Ayesha: Correct.

09:16-09:20 | QuickServe scope and manager
Bilal: Next is QuickServe Services. The project is QuickServe Mobile App. A customer mobile app demo built in Flutter: login, service booking, and booking status.
Ayesha: Are maps or live driver tracking included?
Bilal: No. The client asked about live GPS and map tracking, but we explicitly rejected that for this initial demo. Booking status will be a simple status badge and updates from the backend. No payment integration either.
Hina: Who is managing QuickServe?
Bilal: I am managing QuickServe Mobile App. The delivery deadline is 24 October.

09:20-09:24 | QuickServe mobile screens
Sara: I will take the customer screens. Login and profile screens: 8 hours, deadline 12 October.
Bilal: And the service booking screens?
Sara: Service booking screens will take 12 hours, deadline 17 October. That covers selecting a service, entering request details, and a confirmation screen.
Bilal: Agreed. Sara owns Login and profile screens (8 hours, 12 October) and Service booking screens (12 hours, 17 October).

09:24-09:28 | QuickServe backend APIs
Hamza: I can handle the backend here too. Booking and account APIs: 16 hours, due 16 October. That provides customer account handling, service requests, and request status.
Bilal: Good. This is still one API task under QuickServe. There is no new shared platform project.

09:28-09:32 | QuickServe integration estimate correction
Usman: I will own Mobile integration and testing. Initially I would put it at 8 hours, due 22 October.
Sara: Can that cover the booking status screen, error states, and testing login through booking? Eight sounds a little tight.
Usman: You're right. Make the final estimate 10 hours. Keep the task deadline at 22 October. I will connect the mobile UI to the API, display request status, and test the whole customer flow.
Bilal: Final agreement: Mobile integration and testing, Usman, 10 hours, 22 October. QuickServe still delivers on 24 October. Don't keep the earlier eight-hour estimate.
Ayesha: That's four tasks for QuickServe as well. We are not adding maps or payment tasks.

09:32-09:36 | HelpDeskPro scope and manager
Hina: Third project is HelpDeskPro AI Assistant, for client HelpDeskPro Solutions. An AI-powered support assistant that answers questions from a supplied FAQ document and escalates unresolved questions to human support.
Ayesha: Are we integrating directly into their ticketing tool or email server?
Hina: No, out of scope. For this milestone, escalation just means saving unresolved queries to an escalation queue table with customer contact info so a support rep can review them.
Bilal: Who manages this?
Hina: I will manage HelpDeskPro AI Assistant. Delivery deadline is 22 October.

09:36-09:40 | HelpDeskPro document processing
Maryam: I will own FAQ document processing. That means parsing the FAQ document, chunking content, and setting up the local retrieval store. I estimate 10 hours, deadline 13 October.
Hina: Perfect: Maryam, 10 hours, 13 October.

09:40-09:44 | HelpDeskPro answer generation and escalation
Zain: I will take Assistant answer generation: 14 hours, deadline 17 October. That covers prompt construction, calling the model, and returning structured answers. When the model cannot answer from the FAQ, it signals that it cannot resolve the request.
Hina: And the escalation path?
Zain: Human escalation flow: 6 hours, deadline 18 October. That takes unresolved questions and saves them for human review.
Hina: That works: Zain owns Assistant answer generation (14 hours, 17 October) and Human escalation flow (6 hours, 18 October).
Maryam: What about testing?
Hina: Exactly. Also, the client mentioned someone called Kamran who may supply a document later. Kamran is not a NovaWorks employee. Do not add him to our team or assign development work to him.

09:44-09:48 | HelpDeskPro testing owner correction
Hina: For Assistant evaluation and testing, I was initially considering Zain as the owner. We need to test FAQ answers, unsupported questions, and the escalation path.
Maryam: I can own that instead. It would be better if someone other than the answer-generation developer checks the results.
Hina: Agreed. Replace the earlier suggestion: Maryam is the final owner of Assistant evaluation and testing.
Maryam: Put the estimate at 8 hours, due 21 October. I'll include normal questions and missing-answer cases. That is separate from my ten-hour FAQ document task.
Hina: Confirmed: Maryam, 8 hours, 21 October. Final HelpDeskPro deadline stays 22 October.

09:48-09:52 | Final recap
Ayesha: UrbanCart Website, client UrbanCart Clothing, manager Ayesha, deadline 20 October. Ali owns Product catalog UI: 12 hours, 12 October. Ali owns Demo cart UI: 8 hours, 15 October. Hamza owns Product and cart APIs: 14 hours, 14 October. Ali owns Website integration and testing: 6 hours, 19 October.
Bilal: QuickServe Mobile App, client QuickServe Services, manager Bilal, deadline 24 October. Sara owns Login and profile screens: 8 hours, 12 October. Sara owns Service booking screens: 12 hours, 17 October. Hamza owns Booking and account APIs: 16 hours, 16 October. Usman owns Mobile integration and testing: 10 hours, 22 October.
Hina: HelpDeskPro AI Assistant, client HelpDeskPro Solutions, manager Hina, deadline 22 October. Maryam owns FAQ document processing: 10 hours, 13 October. Zain owns Assistant answer generation: 14 hours, 17 October. Zain owns Human escalation flow: 6 hours, 18 October. Maryam owns Assistant evaluation and testing: 8 hours, 21 October.
Ayesha: Those are the final decisions. Keep the rejected features out. The company already has its nine employees. Create three projects with twelve tasks, then show them in the CRM. That's all for this meeting.
"""

class TestNovaWorksAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        seed_users()
        # Clean any old test projects
        conn = get_connection()
        conn.execute("DELETE FROM tasks;")
        conn.execute("DELETE FROM projects;")
        conn.commit()
        conn.close()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")

    def test_02_login_and_auth_me(self):
        # Invalid login
        resp = self.client.post("/api/auth/login", json={"email": "admin@novaworks.example", "password": "WrongPassword"})
        self.assertEqual(resp.status_code, 401)

        # Valid admin login
        resp = self.client.post("/api/auth/login", json={"email": "admin@novaworks.example", "password": "Demo123!"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "ADMIN")
        token = data["access_token"]

        # Auth me
        resp_me = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(resp_me.status_code, 200)
        self.assertEqual(resp_me.json()["email"], "admin@novaworks.example")

    def test_03_team_directory(self):
        resp_login = self.client.post("/api/auth/login", json={"email": "admin@novaworks.example", "password": "Demo123!"})
        token = resp_login.json()["access_token"]

        resp = self.client.get("/api/users/team", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(resp.status_code, 200)
        users = resp.json()["users"]
        self.assertEqual(len(users), 10)
        # Check no passwords leaked
        for u in users:
            self.assertNotIn("password", u)
            self.assertNotIn("password_hash", u)

    def test_04_transcript_conversion_authorization(self):
        # Non-admin login (e.g. Ayesha - MANAGER)
        resp_mgr = self.client.post("/api/auth/login", json={"email": "ayesha@novaworks.example", "password": "Demo123!"})
        mgr_token = resp_mgr.json()["access_token"]

        # Manager attempting transcript conversion should be 403 Forbidden
        resp_conv = self.client.post(
            "/api/transcript/create",
            headers={"Authorization": f"Bearer {mgr_token}"},
            json={"transcript": "Some text"}
        )
        self.assertEqual(resp_conv.status_code, 403)

        # Unauthenticated request should be 401 Unauthorized
        resp_unauth = self.client.post("/api/transcript/create", json={"transcript": "Some text"})
        self.assertEqual(resp_unauth.status_code, 401)

    def test_05_transcript_conversion_success(self):
        resp_admin = self.client.post("/api/auth/login", json={"email": "admin@novaworks.example", "password": "Demo123!"})
        admin_token = resp_admin.json()["access_token"]

        # Call transcript conversion with sample transcript
        resp = self.client.post(
            "/api/transcript/create",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"transcript": SAMPLE_TRANSCRIPT}
        )
        self.assertEqual(resp.status_code, 200)
        res_data = resp.json()
        self.assertEqual(res_data["projectsCreated"], 3)
        self.assertEqual(res_data["tasksCreated"], 12)

    def test_06_role_filtered_projects_and_tasks(self):
        # 1. Admin sees all 3 projects and all 12 tasks
        admin_token = self.client.post("/api/auth/login", json={"email": "admin@novaworks.example", "password": "Demo123!"}).json()["access_token"]
        p_all = self.client.get("/api/projects", headers={"Authorization": f"Bearer {admin_token}"}).json()["projects"]
        self.assertEqual(len(p_all), 3)

        t_all = self.client.get("/api/tasks", headers={"Authorization": f"Bearer {admin_token}"}).json()["tasks"]
        self.assertEqual(len(t_all), 12)

        # 2. Ayesha (PM01) sees only UrbanCart
        ayesha_token = self.client.post("/api/auth/login", json={"email": "ayesha@novaworks.example", "password": "Demo123!"}).json()["access_token"]
        p_ayesha = self.client.get("/api/projects", headers={"Authorization": f"Bearer {ayesha_token}"}).json()["projects"]
        self.assertEqual(len(p_ayesha), 1)
        self.assertEqual(p_ayesha[0]["name"], "UrbanCart Website")
        self.assertEqual(p_ayesha[0]["deadline"], "2026-10-20")

        # 3. Ali (DEV01) sees only his 3 tasks
        ali_token = self.client.post("/api/auth/login", json={"email": "ali@novaworks.example", "password": "Demo123!"}).json()["access_token"]
        t_ali = self.client.get("/api/tasks", headers={"Authorization": f"Bearer {ali_token}"}).json()["tasks"]
        self.assertEqual(len(t_ali), 3)
        for t in t_ali:
            self.assertEqual(t["assignee"]["id"], "DEV01")

        # Ali project detail should show ONLY his own tasks!
        ali_proj_id = p_all[0]["id"] if p_all[0]["name"] == "UrbanCart Website" else [p["id"] for p in p_all if p["name"] == "UrbanCart Website"][0]
        p_ali_detail = self.client.get(f"/api/projects/{ali_proj_id}", headers={"Authorization": f"Bearer {ali_token}"}).json()
        self.assertEqual(len(p_ali_detail["tasks"]), 3)

        # 4. Hamza (DEV02) sees his 2 tasks across UrbanCart and QuickServe
        hamza_token = self.client.post("/api/auth/login", json={"email": "hamza@novaworks.example", "password": "Demo123!"}).json()["access_token"]
        t_hamza = self.client.get("/api/tasks", headers={"Authorization": f"Bearer {hamza_token}"}).json()["tasks"]
        self.assertEqual(len(t_hamza), 2)
        project_names = {t["projectName"] for t in t_hamza}
        self.assertIn("UrbanCart Website", project_names)
        self.assertIn("QuickServe Mobile App", project_names)

        # 5. Direct unauthorized project detail access
        # Find QuickServe ID
        qs_id = [p["id"] for p in p_all if p["name"] == "QuickServe Mobile App"][0]
        # Ayesha cannot view QuickServe (she manages UrbanCart)
        unauth_resp = self.client.get(f"/api/projects/{qs_id}", headers={"Authorization": f"Bearer {ayesha_token}"})
        self.assertEqual(unauth_resp.status_code, 404)

    def test_07_modified_transcript_demonstrates_dynamic_ai_pipeline(self):
        # Acceptance test scenario 12: Change QuickServe integration estimate to 12 hours and deadline to 23 October
        modified_transcript = SAMPLE_TRANSCRIPT.replace(
            "Final agreement: Mobile integration and testing, Usman, 10 hours, 22 October.",
            "Final agreement: Mobile integration and testing, Usman, 12 hours, 23 October."
        ).replace(
            "Make the final estimate 10 hours. Keep the task deadline at 22 October.",
            "Make the final estimate 12 hours. Keep the task deadline at 23 October."
        )

        admin_token = self.client.post("/api/auth/login", json={"email": "admin@novaworks.example", "password": "Demo123!"}).json()["access_token"]

        # Clear projects and re-run with modified transcript
        conn = get_connection()
        conn.execute("DELETE FROM tasks;")
        conn.execute("DELETE FROM projects;")
        conn.commit()
        conn.close()

        resp = self.client.post(
            "/api/transcript/create",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"transcript": modified_transcript}
        )
        self.assertEqual(resp.status_code, 200)

        # Verify the created task reflects 12 hours and 23 October!
        tasks = self.client.get("/api/tasks", headers={"Authorization": f"Bearer {admin_token}"}).json()["tasks"]
        integration_task = [t for t in tasks if t["title"] == "Mobile integration and testing"][0]
        self.assertEqual(integration_task["estimatedHours"], 12)
        self.assertEqual(integration_task["deadline"], "2026-10-23")

if __name__ == "__main__":
    unittest.main()
