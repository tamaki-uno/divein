"""
Note service for business logic.
"""
from typing import List

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note
from app.schemas.note import NoteCreate


async def get_notes_by_owner(
    db: AsyncSession, owner_id: str, skip: int = 0, limit: int = 100
) -> List[Note]:
    """Get notes by owner."""
    result = await db.execute(
        select(Note)
        .filter_by(owner_id=owner_id)
        .order_by(Note.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def sync_notes(
    db: AsyncSession, notes: List[NoteCreate], owner_id: str
) -> List[Note]:
    """Synchronize notes for a user (replace all existing notes)."""
    # Delete existing notes for this user
    await db.execute(delete(Note).filter_by(owner_id=owner_id))
    
    # Create new notes
    db_notes = [
        Note(**note.model_dump(), owner_id=owner_id)
        for note in notes
    ]
    db.add_all(db_notes)
    await db.commit()
    
    # Refresh all notes to get the latest state
    for note in db_notes:
        await db.refresh(note)
    
    return db_notes
