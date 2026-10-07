from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.project import ProjectListResponse, ProjectDetailResponse
from app.services.project_service import get_projects_for_user, get_project_detail
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=ProjectListResponse)
def list_projects(current_user: dict = Depends(get_current_user)):
    projects = get_projects_for_user(current_user)
    return {"projects": projects}

@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = get_project_detail(project_id, current_user)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or unauthorized"
        )
    return project
