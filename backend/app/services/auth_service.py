import json
from typing import Optional, Dict, Any
from app.db.database import get_connection
from app.core.security import verify_password, create_access_token

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with email and password."""
    conn = get_connection()
    try:
        user = conn.execute(
            "SELECT id, name, email, password_hash, role, specialization, skills FROM users WHERE email = ?",
            (email.strip().lower(),)
        ).fetchone()
        
        if not user:
            return None
        
        if not verify_password(password, user["password_hash"]):
            return None
        
        user_dict = dict(user)
        user_dict.pop("password_hash", None)
        if user_dict.get("skills"):
            try:
                user_dict["skills"] = json.loads(user_dict["skills"])
            except Exception:
                user_dict["skills"] = []
        else:
            user_dict["skills"] = []
            
        return user_dict
    finally:
        conn.close()

def login_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user and return token and public profile."""
    user = authenticate_user(email, password)
    if not user:
        return None
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
