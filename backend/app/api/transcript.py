from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.transcript import TranscriptRequest, TranscriptResponse
from app.services.project_service import get_team_directory, save_transcript_batch
from app.services.ai_service import process_transcript
from app.core.dependencies import require_admin

router = APIRouter(prefix="/transcript", tags=["transcript"])

@router.post("/create", response_model=TranscriptResponse)
def create_from_transcript(req: TranscriptRequest, current_user: dict = Depends(require_admin)):
    transcript_text = req.transcript.strip()
    if not transcript_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Transcript text cannot be empty."
        )

    team_directory = get_team_directory()
    
    try:
        ai_response = process_transcript(transcript_text, team_directory)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation failed: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI extraction failed to generate valid project structures: {str(e)}"
        )

    try:
        result = save_transcript_batch(ai_response.projects)
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Data verification failed: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction failed: {str(e)}"
        )
