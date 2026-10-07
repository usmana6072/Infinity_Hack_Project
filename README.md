# NovaWorks AI Project Manager — Meeting to Execution

> **THE INFINITY HACK ’26 — AI Project Manager Challenge**  
> An autonomous meeting-transcript-to-execution project manager with server-enforced role-based access control, atomic persistence, and structured AI pipeline.

---

## 🚀 Overview

NovaWorks AI Project Manager transforms unstructured meeting transcripts into verified, structured projects and tasks with assignees, delivery deadlines, and estimated developer effort hours. 

The application enforces strict **Role-Based Access Control (RBAC)** across three tiers:
1. **ADMIN**: Full system overview, read-only team directory, and administrative capability to convert meeting transcripts into project & task batches.
2. **MANAGER**: Access strictly filtered to projects managed by the authenticated manager and their corresponding project tasks.
3. **AGENT**: Access restricted strictly to tasks assigned to the authenticated developer and related project summaries (without exposing peer tasks).

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Python 3.14, FastAPI, Pydantic v2 (validation & structured schema enforcement), PyJWT (HS256 tokens), PBKDF2-HMAC-SHA256 password hashing.
- **Database**: SQLite with ACID single-transaction batches, foreign key integrity (`PRAGMA foreign_keys = ON;`), and idempotent upsert seeding. Portable to PostgreSQL.
- **AI Engine**: Google Gemini API via official `google-genai` SDK with strict JSON schema and fallback dynamic rule-based revision resolver.
- **Frontend**: React 19, Vite, React Router v7, Lucide Icons, Modern responsive UI design matching specifications.

---

## 👥 Seeded Demo Accounts

All 10 demo accounts are seeded automatically and use the password **`Demo123!`**:

| Reference | Name | Email | Role | Specialization / Responsibilities |
|---|---|---|---|---|
| `ADMIN` | Admin | `admin@novaworks.example` | **ADMIN** | Company overview, transcript creation |
| `PM01` | Ayesha Khan | `ayesha@novaworks.example` | **MANAGER** | Web PM; manages UrbanCart Website |
| `PM02` | Bilal Ahmed | `bilal@novaworks.example` | **MANAGER** | Mobile PM; manages QuickServe Mobile App |
| `PM03` | Hina Malik | `hina@novaworks.example` | **MANAGER** | AI PM; manages HelpDeskPro AI Assistant |
| `DEV01` | Ali Raza | `ali@novaworks.example` | **AGENT** | Full-Stack; React UI & integration (3 tasks) |
| `DEV02` | Hamza Shah | `hamza@novaworks.example` | **AGENT** | Full-Stack; Node/APIs (2 tasks across 2 projects) |
| `DEV03` | Sara Noor | `sara@novaworks.example` | **AGENT** | App Developer; Flutter UI (2 tasks) |
| `DEV04` | Usman Tariq | `usman@novaworks.example` | **AGENT** | App Developer; Mobile integration & testing (1 task) |
| `DEV05` | Zain Abbas | `zain@novaworks.example` | **AGENT** | AI Developer; Answer gen & escalation (2 tasks) |
| `DEV06` | Maryam Asif | `maryam@novaworks.example` | **AGENT** | AI Developer; FAQ retrieval & testing (2 tasks) |

---

## ⚡ Quick Start & Run Commands

### 1. Prerequisites
- Python 3.11+ (tested on Python 3.14)
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run idempotent database seeding
python -m app.db.seed

# Start the FastAPI server (runs on port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on port 5173 with backend proxy)
npm run dev
```

Visit **`http://localhost:5173`** (or `http://localhost:8000` for the production build) in your browser.

---

## 🧪 Running Automated Tests

Run the full automated test suite verifying authentication, authorization boundaries, transcript extraction, and modified-transcript dynamic behavior:

```bash
cd backend
python -m unittest test_backend.py
```

All 7 test suites validate:
- Health check endpoints
- Idempotent seeding & password verification
- Safe team directory serialization (no leaked credentials)
- Non-admin prohibition on transcript conversion (`403 Forbidden`)
- Atomic transcript conversion (3 projects, 12 tasks)
- Manager isolation (Ayesha sees only UrbanCart, Bilal only QuickServe, Hina only HelpDeskPro)
- Agent isolation (Ali sees only his 3 tasks; unauthorized project queries return `404`)
- Genuine dynamic AI processing when modifying hours and deadlines

---

## 📋 Evaluation & Demo Walkthrough

1. **Log in as Admin** (`admin@novaworks.example` / `Demo123!` or click the quick demo chip).
2. Navigate to **AI Transcript** (`/transcript`).
3. Click **Load Official Transcript** and then **Create Projects & Tasks**.
4. Observe the step checklist execute and verify that exactly **3 projects** and **12 tasks** are created atomically.
5. Review the project breakdown:
   - **UrbanCart Website**: Delivery `2026-10-20` (reflecting client extension), Ali (3 tasks), Hamza (1 task).
   - **QuickServe Mobile App**: Delivery `2026-10-24`, Sara (2 tasks), Hamza (1 task), Usman (Mobile integration revised to 10 hours, due `2026-10-22`).
   - **HelpDeskPro AI Assistant**: Delivery `2026-10-22`, Maryam (FAQ processing & Evaluation revised to Maryam for 8h on `2026-10-21`), Zain (Answer generation & Human escalation).
6. **Log out** and log in as **Ayesha Khan** (`ayesha@novaworks.example`):
   - Only UrbanCart Website is visible.
7. **Log out** and log in as **Ali Raza** (`ali@novaworks.example`):
   - Only Ali's 3 tasks appear under "My Tasks" and project details. Other agent tasks are not returned by the API.
8. **Log out** and log in as **Hamza Shah** (`hamza@novaworks.example`):
   - Hamza sees his 2 tasks spanning across both UrbanCart and QuickServe.
9. **Modified Transcript Verification**:
   - Change Usman's integration estimate to `12 hours` and deadline to `23 October` in the transcript text; submit to verify the system dynamically updates the parsed record.

---

## 🔒 Security & Safe Persistence
- **No plaintext passwords**: All credentials hashed using PBKDF2 with unique salts.
- **Zero AI credential leakage**: Team directory sent to LLM omits all password fields.
- **ACID Transactions**: If any single task or reference fails verification, all insertions roll back completely.
- **Duplicate Prevention**: Submission buttons are disabled during processing to avoid duplicate writes.

---

## 📁 Repository Structure

```text
Infinity_Hack_Project/
├── backend/
│   ├── app/
│   │   ├── api/             # API Routers (/auth, /users, /projects, /tasks, /transcript)
│   │   ├── core/            # Configuration, Security, JWT & Auth Dependencies
│   │   ├── db/              # SQLite connection, ACID transactions, Idempotent Seeding
│   │   ├── schemas/         # Pydantic validation & structured output models
│   │   ├── services/        # Business logic & Google Gemini AI Pipeline
│   │   └── main.py          # FastAPI application entrypoint & static mount
│   ├── requirements.txt     # Python dependencies
│   ├── test_backend.py      # Automated acceptance test suite
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Topbar, Toast
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Login, Dashboard, Projects, ProjectDetail, MyTasks, Team, Transcript
│   │   ├── services/        # API client
│   │   ├── App.jsx          # Protected route shell
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/                    # Challenge specifications & mockups
├── .gitignore
└── README.md
```
