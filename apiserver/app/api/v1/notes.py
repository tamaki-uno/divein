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
from app.services.note_service import note


router = APIRouter()


@router.get("/", response_model=List[Note])
async def get_notes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all notes for the current user."""
    return await note.get_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)


@router.post("/sync", response_model=List[Note])
async def sync_notes(
    sync_request: NoteSyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Synchronize notes from client."""
    return await note.sync_notes(
        db, notes=sync_request.notes, owner_id=current_user.id
    )
