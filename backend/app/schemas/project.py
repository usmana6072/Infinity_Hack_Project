from typing import Optional, List
from pydantic import BaseModel
from app.schemas.task import TaskDetailItem

class ManagerBrief(BaseModel):
    id: str
    name: str

class ProjectListItem(BaseModel):
    id: str
    name: str
    clientName: str
    description: Optional[str] = ""
    manager: ManagerBrief
    deadline: str
    taskCount: int

class ProjectListResponse(BaseModel):
    projects: List[ProjectListItem]

class ProjectDetailResponse(BaseModel):
    id: str
    name: str
    clientName: str
    description: Optional[str] = ""
    manager: ManagerBrief
    deadline: str
    tasks: List[TaskDetailItem]
