from typing import Optional, List
from pydantic import BaseModel

class AssigneeBrief(BaseModel):
    id: str
    name: str

class TaskDetailItem(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    assignee: AssigneeBrief
    deadline: str
    estimatedHours: float
    remainingHours: float = 0.0
    status: str = "TODO"

class TaskListItem(BaseModel):
    id: str
    projectId: str
    projectName: str
    title: str
    description: Optional[str] = ""
    assignee: AssigneeBrief
    deadline: str
    estimatedHours: float
    remainingHours: float = 0.0
    status: str = "TODO"

class TaskListResponse(BaseModel):
    tasks: List[TaskListItem]

class TaskUpdateRequest(BaseModel):
    assigneeId: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None
    deadline: Optional[str] = None
    estimatedHours: Optional[float] = None
    remainingHours: Optional[float] = None
