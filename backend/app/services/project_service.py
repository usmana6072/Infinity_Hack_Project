import uuid
import json
from typing import List, Dict, Any, Optional
from app.db.database import get_connection
from app.core.security import hash_password
from app.schemas.transcript import AIProject

def create_team_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Add a new developer agent or project manager to the team."""
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    role = data.get("role", "AGENT").strip().upper()
    specialization = data.get("specialization", "").strip()
    skills = data.get("skills", [])
    password = data.get("password") or "Demo123!"

    if not name:
        raise ValueError("Name cannot be empty.")
    if not email:
        raise ValueError("Email cannot be empty.")
    if role not in ("AGENT", "MANAGER"):
        raise ValueError("Role must be 'AGENT' or 'MANAGER'.")

    conn = get_connection()
    try:
        # Check duplicate email
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            raise ValueError(f"User with email '{email}' already exists.")

        # Determine next ID
        prefix = "DEV" if role == "AGENT" else "PM"
        rows = conn.execute("SELECT id FROM users WHERE id LIKE ?", (f"{prefix}%",)).fetchall()
        max_num = 0
        for r in rows:
            uid = r["id"]
            num_part = uid[len(prefix):]
            if num_part.isdigit():
                max_num = max(max_num, int(num_part))
        next_id = f"{prefix}{max_num + 1:02d}"

        pwd_hash = hash_password(password)
        skills_json = json.dumps(skills)

        conn.execute("""
            INSERT INTO users (id, name, email, password_hash, role, specialization, skills)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (next_id, name, email, pwd_hash, role, specialization, skills_json))
        conn.commit()

        return {
            "id": next_id,
            "name": name,
            "email": email,
            "role": role,
            "specialization": specialization,
            "skills": skills
        }
    finally:
        conn.close()

def get_team_directory() -> List[Dict[str, Any]]:
    """Retrieve safe read-only team directory."""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, name, role, specialization, skills FROM users ORDER BY id ASC"
        ).fetchall()
        team = []
        for r in rows:
            u = dict(r)
            if u.get("skills"):
                try:
                    u["skills"] = json.loads(u["skills"])
                except Exception:
                    u["skills"] = []
            else:
                u["skills"] = []
            team.append(u)
        return team
    finally:
        conn.close()

def get_projects_for_user(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Get project list filtered by role-based permissions."""
    role = user["role"]
    user_id = user["id"]
    conn = get_connection()
    try:
        if role == "ADMIN":
            query = """
            SELECT p.id, p.name, p.client_name AS clientName, p.description, p.deadline,
                   u.id AS manager_id, u.name AS manager_name,
                   COUNT(t.id) AS taskCount
            FROM projects p
            JOIN users u ON p.manager_id = u.id
            LEFT JOIN tasks t ON p.id = t.project_id
            GROUP BY p.id
            ORDER BY p.deadline ASC;
            """
            rows = conn.execute(query).fetchall()
        elif role == "MANAGER":
            query = """
            SELECT p.id, p.name, p.client_name AS clientName, p.description, p.deadline,
                   u.id AS manager_id, u.name AS manager_name,
                   COUNT(t.id) AS taskCount
            FROM projects p
            JOIN users u ON p.manager_id = u.id
            LEFT JOIN tasks t ON p.id = t.project_id
            WHERE p.manager_id = ?
            GROUP BY p.id
            ORDER BY p.deadline ASC;
            """
            rows = conn.execute(query, (user_id,)).fetchall()
        elif role == "AGENT":
            query = """
            SELECT DISTINCT p.id, p.name, p.client_name AS clientName, p.description, p.deadline,
                   u.id AS manager_id, u.name AS manager_name,
                   COUNT(t_own.id) AS taskCount
            FROM projects p
            JOIN users u ON p.manager_id = u.id
            JOIN tasks t_filter ON p.id = t_filter.project_id AND t_filter.assignee_id = ?
            LEFT JOIN tasks t_own ON p.id = t_own.project_id AND t_own.assignee_id = ?
            GROUP BY p.id
            ORDER BY p.deadline ASC;
            """
            rows = conn.execute(query, (user_id, user_id)).fetchall()
        else:
            return []

        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "name": r["name"],
                "clientName": r["clientName"],
                "description": r["description"] or "",
                "manager": {
                    "id": r["manager_id"],
                    "name": r["manager_name"]
                },
                "deadline": r["deadline"],
                "taskCount": int(r["taskCount"])
            })
        return result
    finally:
        conn.close()

def get_project_detail(project_id: str, user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Get project details and authorized tasks.
    Returns None (for 404) if project does not exist or user is unauthorized.
    """
    role = user["role"]
    user_id = user["id"]
    conn = get_connection()
    try:
        # Check project existence and basic authorization
        p_row = conn.execute("""
            SELECT p.id, p.name, p.client_name AS clientName, p.description, p.deadline,
                   u.id AS manager_id, u.name AS manager_name
            FROM projects p
            JOIN users u ON p.manager_id = u.id
            WHERE p.id = ?
        """, (project_id,)).fetchone()

        if not p_row:
            return None

        # Check authorization
        if role == "MANAGER" and p_row["manager_id"] != user_id:
            return None
        
        if role == "AGENT":
            # Check if agent has at least one task in this project
            has_task = conn.execute(
                "SELECT 1 FROM tasks WHERE project_id = ? AND assignee_id = ? LIMIT 1",
                (project_id, user_id)
            ).fetchone()
            if not has_task:
                return None

        # Fetch authorized tasks
        if role == "AGENT":
            task_rows = conn.execute("""
                SELECT t.id, t.title, t.description, t.deadline, t.estimated_hours AS estimatedHours,
                       COALESCE(t.remaining_hours, t.estimated_hours) AS remainingHours,
                       COALESCE(t.status, 'TODO') AS status,
                       u.id AS assignee_id, u.name AS assignee_name
                FROM tasks t
                JOIN users u ON t.assignee_id = u.id
                WHERE t.project_id = ? AND t.assignee_id = ?
                ORDER BY t.deadline ASC;
            """, (project_id, user_id)).fetchall()
        else:
            task_rows = conn.execute("""
                SELECT t.id, t.title, t.description, t.deadline, t.estimated_hours AS estimatedHours,
                       COALESCE(t.remaining_hours, t.estimated_hours) AS remainingHours,
                       COALESCE(t.status, 'TODO') AS status,
                       u.id AS assignee_id, u.name AS assignee_name
                FROM tasks t
                JOIN users u ON t.assignee_id = u.id
                WHERE t.project_id = ?
                ORDER BY t.deadline ASC;
            """, (project_id,)).fetchall()

        tasks = [
            {
                "id": t["id"],
                "title": t["title"],
                "description": t["description"] or "",
                "assignee": {
                    "id": t["assignee_id"],
                    "name": t["assignee_name"]
                },
                "deadline": t["deadline"],
                "estimatedHours": float(t["estimatedHours"]),
                "remainingHours": float(t["remainingHours"]),
                "status": t.get("status", "TODO")
            }
            for t in task_rows
        ]

        return {
            "id": p_row["id"],
            "name": p_row["name"],
            "clientName": p_row["clientName"],
            "description": p_row["description"] or "",
            "manager": {
                "id": p_row["manager_id"],
                "name": p_row["manager_name"]
            },
            "deadline": p_row["deadline"],
            "tasks": tasks
        }
    finally:
        conn.close()

def get_tasks_for_user(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    """List tasks filtered by role permissions."""
    role = user["role"]
    user_id = user["id"]
    conn = get_connection()
    try:
        if role == "ADMIN":
            rows = conn.execute("""
                SELECT t.id, t.project_id AS projectId, p.name AS projectName,
                       t.title, t.description, t.deadline, t.estimated_hours AS estimatedHours,
                       COALESCE(t.remaining_hours, t.estimated_hours) AS remainingHours,
                       COALESCE(t.status, 'TODO') AS status,
                       u.id AS assignee_id, u.name AS assignee_name
                FROM tasks t
                JOIN projects p ON t.project_id = p.id
                JOIN users u ON t.assignee_id = u.id
                ORDER BY t.deadline ASC;
            """).fetchall()
        elif role == "MANAGER":
            rows = conn.execute("""
                SELECT t.id, t.project_id AS projectId, p.name AS projectName,
                       t.title, t.description, t.deadline, t.estimated_hours AS estimatedHours,
                       COALESCE(t.remaining_hours, t.estimated_hours) AS remainingHours,
                       COALESCE(t.status, 'TODO') AS status,
                       u.id AS assignee_id, u.name AS assignee_name
                FROM tasks t
                JOIN projects p ON t.project_id = p.id
                JOIN users u ON t.assignee_id = u.id
                WHERE p.manager_id = ?
                ORDER BY t.deadline ASC;
            """, (user_id,)).fetchall()
        elif role == "AGENT":
            rows = conn.execute("""
                SELECT t.id, t.project_id AS projectId, p.name AS projectName,
                       t.title, t.description, t.deadline, t.estimated_hours AS estimatedHours,
                       COALESCE(t.remaining_hours, t.estimated_hours) AS remainingHours,
                       COALESCE(t.status, 'TODO') AS status,
                       u.id AS assignee_id, u.name AS assignee_name
                FROM tasks t
                JOIN projects p ON t.project_id = p.id
                JOIN users u ON t.assignee_id = u.id
                WHERE t.assignee_id = ?
                ORDER BY t.deadline ASC;
            """, (user_id,)).fetchall()
        else:
            return []

        return [
            {
                "id": r["id"],
                "projectId": r["projectId"],
                "projectName": r["projectName"],
                "title": r["title"],
                "description": r["description"] or "",
                "assignee": {
                    "id": r["assignee_id"],
                    "name": r["assignee_name"]
                },
                "deadline": r["deadline"],
                "estimatedHours": float(r["estimatedHours"]),
                "remainingHours": float(r["remainingHours"]),
                "status": r.get("status", "TODO")
            }
            for r in rows
        ]
    finally:
        conn.close()

def update_task(task_id: str, update_data: Dict[str, Any], current_user: Dict[str, Any]) -> Dict[str, Any]:
    """Update task assignee, status, remaining hours, or details with role validation."""
    role = current_user["role"]
    user_id = current_user["id"]
    conn = get_connection()
    try:
        task = conn.execute("""
            SELECT t.id, t.project_id, t.assignee_id, COALESCE(t.status, 'TODO') AS status,
                   t.estimated_hours, COALESCE(t.remaining_hours, t.estimated_hours) AS remaining_hours,
                   p.manager_id
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE t.id = ?
        """, (task_id,)).fetchone()

        if not task:
            raise ValueError("Task not found.")

        # Reassign logic
        if "assigneeId" in update_data and update_data["assigneeId"]:
            if role not in ("ADMIN", "MANAGER"):
                raise PermissionError("Only Administrators and Project Managers can reassign tasks.")
            if role == "MANAGER" and task["manager_id"] != user_id:
                raise PermissionError("You can only reassign tasks in projects you manage.")
            
            new_assignee_id = update_data["assigneeId"].strip()
            assignee = conn.execute("SELECT id, name, role FROM users WHERE id = ?", (new_assignee_id,)).fetchone()
            if not assignee:
                raise ValueError(f"Assignee '{new_assignee_id}' does not exist.")
            if assignee["role"] != "AGENT":
                raise ValueError(f"User '{assignee['name']}' ({assignee['id']}) is a {assignee['role']}, not an AGENT.")
            
            conn.execute("UPDATE tasks SET assignee_id = ? WHERE id = ?", (new_assignee_id, task_id))

        # Status update logic
        if "status" in update_data and update_data["status"]:
            new_status = update_data["status"].strip().upper()
            if new_status not in ("TODO", "IN_PROGRESS", "COMPLETED"):
                raise ValueError("Status must be one of: 'TODO', 'IN_PROGRESS', 'COMPLETED'.")
            
            if role == "AGENT" and task["assignee_id"] != user_id:
                raise PermissionError("You can only update status for your own assigned tasks.")
            if role == "MANAGER" and task["manager_id"] != user_id:
                raise PermissionError("You can only update tasks in projects you manage.")
            
            conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
            if new_status == "COMPLETED" and "remainingHours" not in update_data:
                conn.execute("UPDATE tasks SET remaining_hours = 0 WHERE id = ?", (task_id,))

        # Remaining hours update logic
        if "remainingHours" in update_data and update_data["remainingHours"] is not None:
            new_rem_hours = float(update_data["remainingHours"])
            if new_rem_hours < 0:
                raise ValueError("Remaining hours cannot be negative.")
            
            if role == "AGENT" and task["assignee_id"] != user_id:
                raise PermissionError("You can only update remaining hours for your own assigned tasks.")
            if role == "MANAGER" and task["manager_id"] != user_id:
                raise PermissionError("You can only update tasks in projects you manage.")
            
            conn.execute("UPDATE tasks SET remaining_hours = ? WHERE id = ?", (new_rem_hours, task_id))
            if new_rem_hours == 0 and "status" not in update_data:
                conn.execute("UPDATE tasks SET status = 'COMPLETED' WHERE id = ?", (task_id,))

        conn.commit()

        updated_row = conn.execute("""
            SELECT t.id, t.project_id AS projectId, p.name AS projectName,
                   t.title, t.description, t.deadline, t.estimated_hours AS estimatedHours,
                   COALESCE(t.remaining_hours, t.estimated_hours) AS remainingHours,
                   COALESCE(t.status, 'TODO') AS status,
                   u.id AS assignee_id, u.name AS assignee_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN users u ON t.assignee_id = u.id
            WHERE t.id = ?
        """, (task_id,)).fetchone()

        return {
            "id": updated_row["id"],
            "projectId": updated_row["projectId"],
            "projectName": updated_row["projectName"],
            "title": updated_row["title"],
            "description": updated_row["description"] or "",
            "assignee": {
                "id": updated_row["assignee_id"],
                "name": updated_row["assignee_name"]
            },
            "deadline": updated_row["deadline"],
            "estimatedHours": float(updated_row["estimatedHours"]),
            "remainingHours": float(updated_row["remainingHours"]),
            "status": updated_row["status"]
        }
    finally:
        conn.close()

def save_transcript_batch(ai_projects: List[AIProject]) -> Dict[str, Any]:
    """Atomically validate references and persist projects and tasks within a single transaction."""
    conn = get_connection()
    try:
        # Load all valid users and roles
        users_rows = conn.execute("SELECT id, name, role FROM users").fetchall()
        user_map = {u["id"]: u for u in users_rows}
        name_map = {u["name"].lower(): u for u in users_rows}

        # Validate all references before starting write transaction
        for p in ai_projects:
            m_ref = (p.managerRef or p.managerId or "").strip()
            manager = user_map.get(m_ref) or name_map.get(m_ref.lower())
            if not manager:
                raise ValueError(f"Manager reference '{m_ref}' does not match any registered team member.")
            if manager["role"] != "MANAGER":
                raise ValueError(f"User '{manager['name']}' ({manager['id']}) is a {manager['role']}, not a MANAGER.")
            
            # Resolve to canonical ID
            p.managerId = manager["id"]

            for t in p.tasks:
                a_ref = (t.assigneeRef or t.assigneeId or "").strip()
                assignee = user_map.get(a_ref) or name_map.get(a_ref.lower())
                if not assignee:
                    raise ValueError(f"Task assignee reference '{a_ref}' does not match any registered team member.")
                if assignee["role"] != "AGENT":
                    raise ValueError(f"User '{assignee['name']}' ({assignee['id']}) is a {assignee['role']}, not an AGENT.")
                
                # Resolve to canonical ID
                t.assigneeId = assignee["id"]

        # All references are valid. Begin atomic transaction.
        created_projects = []
        total_tasks_created = 0

        with conn:
            for p in ai_projects:
                proj_id = f"proj_{uuid.uuid4().hex[:8]}"
                conn.execute("""
                    INSERT INTO projects (id, name, client_name, description, manager_id, deadline)
                    VALUES (?, ?, ?, ?, ?, ?);
                """, (
                    proj_id,
                    p.name.strip(),
                    p.clientName.strip(),
                    p.description.strip() if p.description else "",
                    p.managerId,
                    p.deadline.strip()
                ))

                for t in p.tasks:
                    task_id = f"task_{uuid.uuid4().hex[:8]}"
                    conn.execute("""
                        INSERT INTO tasks (id, project_id, title, description, assignee_id, deadline, estimated_hours, remaining_hours)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                    """, (
                        task_id,
                        proj_id,
                        t.title.strip(),
                        t.description.strip() if t.description else "",
                        t.assigneeId,
                        t.deadline.strip(),
                        float(t.estimatedHours),
                        float(t.estimatedHours)
                    ))
                    total_tasks_created += 1

                created_projects.append({
                    "id": proj_id,
                    "name": p.name.strip(),
                    "taskCount": len(p.tasks)
                })

        return {
            "message": "Projects and tasks created successfully.",
            "projectsCreated": len(created_projects),
            "tasksCreated": total_tasks_created,
            "projects": created_projects
        }
    finally:
        conn.close()
