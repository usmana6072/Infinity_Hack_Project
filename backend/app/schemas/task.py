from typing import Optional
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

class TaskListItem(BaseModel):
    id: str
    projectId: str
    projectName: str
    title: str
    description: Optional[str] = ""
    assignee: AssigneeBrief
    deadline: str
    estimatedHours: float

class TaskListResponse(BaseModel):
    tasks: list[TaskListItem]
