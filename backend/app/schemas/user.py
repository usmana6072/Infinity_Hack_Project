from typing import Optional, List
from pydantic import BaseModel

class TeamUser(BaseModel):
    id: str
    name: str
    role: str
    specialization: Optional[str] = None
    skills: List[str] = []

class TeamResponse(BaseModel):
    users: List[TeamUser]

class CreateUserRequest(BaseModel):
    name: str
    email: str
    role: str = "AGENT"
    specialization: Optional[str] = None
    skills: List[str] = []
    password: Optional[str] = "Demo123!"
