from fastapi import APIRouter, Depends
from app.schemas.task import TaskListResponse
from app.services.project_service import get_tasks_for_user
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=TaskListResponse)
def list_tasks(current_user: dict = Depends(get_current_user)):
    tasks = get_tasks_for_user(current_user)
    return {"tasks": tasks}

@router.get("/my", response_model=TaskListResponse)
def list_my_tasks(current_user: dict = Depends(get_current_user)):
    # For convenience, returns tasks assigned to or appropriate for the logged-in user
    tasks = get_tasks_for_user(current_user)
    if current_user["role"] == "AGENT":
        tasks = [t for t in tasks if t["assignee"]["id"] == current_user["id"]]
    return {"tasks": tasks}
