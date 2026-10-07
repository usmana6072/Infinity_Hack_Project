from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import TeamResponse, TeamUser, CreateUserRequest
from app.services.project_service import get_team_directory, create_team_user
from app.core.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/team", response_model=TeamResponse)
def get_team(current_user: dict = Depends(get_current_user)):
    team = get_team_directory()
    return {"users": team}

@router.post("", response_model=TeamUser)
def create_user(req: CreateUserRequest, current_user: dict = Depends(require_admin)):
    try:
        new_user = create_team_user(req.model_dump())
        return new_user
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add user: {str(e)}")
