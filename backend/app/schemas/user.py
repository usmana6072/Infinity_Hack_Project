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
