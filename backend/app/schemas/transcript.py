import re
from typing import Optional, List
from pydantic import BaseModel, Field, model_validator

DATE_REGEX = re.compile(r"^\d{4}-\d{2}-\d{2}$")

class TranscriptRequest(BaseModel):
    transcript: str

class AITask(BaseModel):
    title: str
    description: Optional[str] = ""
    assigneeRef: Optional[str] = None
    assigneeId: Optional[str] = None
    deadline: str
    estimatedHours: float

    @model_validator(mode="after")
    def check_task(self):
        # Resolve assigneeRef / assigneeId
        ref = self.assigneeRef or self.assigneeId
        if not ref:
            raise ValueError("assigneeRef or assigneeId is required")
        self.assigneeRef = ref
        self.assigneeId = ref
        
        if not self.title.strip():
            raise ValueError("Task title cannot be empty")
        if not DATE_REGEX.match(self.deadline):
            raise ValueError(f"Task deadline '{self.deadline}' must be in YYYY-MM-DD format")
        if self.estimatedHours <= 0:
            raise ValueError(f"Estimated hours must be greater than 0, got {self.estimatedHours}")
        return self

class AIProject(BaseModel):
    name: str
    clientName: str
    description: Optional[str] = ""
    managerRef: Optional[str] = None
    managerId: Optional[str] = None
    deadline: str
    tasks: List[AITask] = Field(default_factory=list)

    @model_validator(mode="after")
    def check_project(self):
        ref = self.managerRef or self.managerId
        if not ref:
            raise ValueError("managerRef or managerId is required")
        self.managerRef = ref
        self.managerId = ref
        
        if not self.name.strip():
            raise ValueError("Project name cannot be empty")
        if not self.clientName.strip():
            raise ValueError("Client name cannot be empty")
        if not DATE_REGEX.match(self.deadline):
            raise ValueError(f"Project deadline '{self.deadline}' must be in YYYY-MM-DD format")
        if not self.tasks:
            raise ValueError(f"Project '{self.name}' must have at least one task")
        
        # Check task deadlines do not exceed project deadline
        for task in self.tasks:
            if task.deadline > self.deadline:
                raise ValueError(
                    f"Task '{task.title}' deadline ({task.deadline}) exceeds project deadline ({self.deadline})"
                )
        return self

class AIResponse(BaseModel):
    projects: List[AIProject]

class ProjectSummary(BaseModel):
    id: str
    name: str
    taskCount: int

class TranscriptResponse(BaseModel):
    message: str
    projectsCreated: int
    tasksCreated: int
    projects: List[ProjectSummary]
