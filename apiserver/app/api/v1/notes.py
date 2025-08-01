"""
Notes endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_active_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.note import Note, NoteSyncRequest
from app.services import note_service


router = APIRouter()


@router.get("/", response_model=List[Note])
async def get_notes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all notes for the current user."""
    return await note_service.get_notes_by_owner(
        db, current_user.id, skip=skip, limit=limit
    )


@router.post("/sync", response_model=List[Note])
async def sync_notes(
    sync_request: NoteSyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Sync notes with client data."""
    return await note_service.sync_notes(db, current_user.id, sync_request)
