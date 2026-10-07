from fastapi import APIRouter, Depends
from app.schemas.user import TeamResponse
from app.services.project_service import get_team_directory
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/team", response_model=TeamResponse)
def get_team(current_user: dict = Depends(get_current_user)):
    team = get_team_directory()
    return {"users": team}
