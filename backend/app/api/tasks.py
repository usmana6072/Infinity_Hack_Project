from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.task import TaskListResponse, TaskListItem, TaskUpdateRequest
from app.services.project_service import get_tasks_for_user, update_task
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=TaskListResponse)
def list_tasks(current_user: dict = Depends(get_current_user)):
    tasks = get_tasks_for_user(current_user)
    return {"tasks": tasks}

@router.get("/my", response_model=TaskListResponse)
def list_my_tasks(current_user: dict = Depends(get_current_user)):
    tasks = get_tasks_for_user(current_user)
    if current_user["role"] == "AGENT":
        tasks = [t for t in tasks if t["assignee"]["id"] == current_user["id"]]
    return {"tasks": tasks}

@router.patch("/{task_id}", response_model=TaskListItem)
def patch_task(task_id: str, req: TaskUpdateRequest, current_user: dict = Depends(get_current_user)):
    try:
        updated = update_task(task_id, req.model_dump(exclude_unset=True), current_user)
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Update failed: {str(e)}")
