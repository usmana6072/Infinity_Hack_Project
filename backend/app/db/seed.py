import json
from app.db.database import init_db, get_connection
from app.core.security import hash_password

DEMO_USERS = [
    {
        "id": "ADMIN",
        "name": "Admin",
        "email": "admin@novaworks.example",
        "role": "ADMIN",
        "specialization": "Administrator",
        "skills": ["Company overview", "Transcript creation"]
    },
    {
        "id": "PM01",
        "name": "Ayesha Khan",
        "email": "ayesha@novaworks.example",
        "role": "MANAGER",
        "specialization": "Web PM",
        "skills": ["Web projects", "Client coordination"]
    },
    {
        "id": "PM02",
        "name": "Bilal Ahmed",
        "email": "bilal@novaworks.example",
        "role": "MANAGER",
        "specialization": "Mobile PM",
        "skills": ["Mobile projects", "Delivery planning"]
    },
    {
        "id": "PM03",
        "name": "Hina Malik",
        "email": "hina@novaworks.example",
        "role": "MANAGER",
        "specialization": "AI PM",
        "skills": ["AI projects", "Requirement review"]
    },
    {
        "id": "DEV01",
        "name": "Ali Raza",
        "email": "ali@novaworks.example",
        "role": "AGENT",
        "specialization": "Full-Stack",
        "skills": ["React", "Frontend integration"]
    },
    {
        "id": "DEV02",
        "name": "Hamza Shah",
        "email": "hamza@novaworks.example",
        "role": "AGENT",
        "specialization": "Full-Stack",
        "skills": ["Node.js", "Databases", "APIs"]
    },
    {
        "id": "DEV03",
        "name": "Sara Noor",
        "email": "sara@novaworks.example",
        "role": "AGENT",
        "specialization": "App Developer",
        "skills": ["Flutter", "Mobile UI"]
    },
    {
        "id": "DEV04",
        "name": "Usman Tariq",
        "email": "usman@novaworks.example",
        "role": "AGENT",
        "specialization": "App Developer",
        "skills": ["Flutter", "Integration", "Testing"]
    },
    {
        "id": "DEV05",
        "name": "Zain Abbas",
        "email": "zain@novaworks.example",
        "role": "AGENT",
        "specialization": "AI Developer",
        "skills": ["LLMs", "Extraction", "Prompts"]
    },
    {
        "id": "DEV06",
        "name": "Maryam Asif",
        "email": "maryam@novaworks.example",
        "role": "AGENT",
        "specialization": "AI Developer",
        "skills": ["Retrieval", "Document processing"]
    }
]

DEFAULT_PASSWORD = "Demo123!"

def seed_users():
    """Seed the 10 demo accounts idempotently."""
    init_db()
    conn = get_connection()
    try:
        with conn:
            hashed = hash_password(DEFAULT_PASSWORD)
            for user in DEMO_USERS:
                skills_json = json.dumps(user["skills"])
                # Upsert by email or id
                conn.execute("""
                INSERT INTO users (id, name, email, password_hash, role, specialization, skills)
                VALUES (:id, :name, :email, :password_hash, :role, :specialization, :skills)
                ON CONFLICT(email) DO UPDATE SET
                    id=excluded.id,
                    name=excluded.name,
                    password_hash=excluded.password_hash,
                    role=excluded.role,
                    specialization=excluded.specialization,
                    skills=excluded.skills;
                """, {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "password_hash": hashed,
                    "role": user["role"],
                    "specialization": user["specialization"],
                    "skills": skills_json
                })
        print(f"Successfully seeded {len(DEMO_USERS)} demo users.")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_users()
