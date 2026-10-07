import sqlite3
import json
from pathlib import Path
from contextlib import contextmanager
from typing import Generator
from app.core.config import settings

def get_db_path() -> str:
    path = Path(settings.DATABASE_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    return str(path)

def dict_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path(), timeout=30.0, check_same_thread=False)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = dict_factory
    return conn

@contextmanager
def get_db_cursor() -> Generator[sqlite3.Cursor, None, None]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Create database tables if they do not exist."""
    conn = get_connection()
    try:
        with conn:
            conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('ADMIN', 'MANAGER', 'AGENT')),
                specialization TEXT,
                skills TEXT
            );
            """)
            
            conn.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                client_name TEXT NOT NULL,
                description TEXT,
                manager_id TEXT NOT NULL,
                deadline TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
            );
            """)
            
            conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                assignee_id TEXT NOT NULL,
                deadline TEXT NOT NULL,
                estimated_hours REAL NOT NULL CHECK(estimated_hours > 0),
                remaining_hours REAL,
                status TEXT NOT NULL DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE RESTRICT
            );
            """)

            # Check if status and remaining_hours columns exist in tasks, add if missing
            cursor = conn.execute("PRAGMA table_info(tasks);")
            columns = [row["name"] for row in cursor.fetchall()]
            if "status" not in columns:
                conn.execute("ALTER TABLE tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'TODO';")
            if "remaining_hours" not in columns:
                conn.execute("ALTER TABLE tasks ADD COLUMN remaining_hours REAL;")
                conn.execute("UPDATE tasks SET remaining_hours = estimated_hours WHERE remaining_hours IS NULL;")
            
            # Useful indexes
            conn.execute("CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);")
    finally:
        conn.close()
