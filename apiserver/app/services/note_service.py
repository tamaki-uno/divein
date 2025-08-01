"""
Note service for business logic.
"""
from typing import List

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base_crud import CRUDBase
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


class CRUDNote(CRUDBase[Note, NoteCreate, NoteUpdate]):
    async def get_by_owner(
        self, db: AsyncSession, *, owner_id: str, skip: int = 0, limit: int = 100
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

    async def create_with_owner(
        self, db: AsyncSession, *, obj_in: NoteCreate, owner_id: str
    ) -> Note:
        """Create note with owner."""
        db_note = Note(
            **obj_in.model_dump(),
            owner_id=owner_id
        )
        db.add(db_note)
        await db.commit()
        await db.refresh(db_note)
        return db_note

    async def sync_notes(
        self, db: AsyncSession, *, notes: List[NoteCreate], owner_id: str
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

    async def delete_by_owner(self, db: AsyncSession, *, owner_id: str) -> int:
        """Delete all notes by owner."""
        result = await db.execute(delete(Note).filter_by(owner_id=owner_id))
        await db.commit()
        return result.rowcount


# Create CRUD instance
note = CRUDNote(Note)
