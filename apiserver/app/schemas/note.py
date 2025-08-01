"""
Note schemas for API serialization.
"""
from typing import Optional
from pydantic import BaseModel


class NoteBase(BaseModel):
    """Base note schema."""
    title: str
    content: str


class NoteCreate(NoteBase):
    """Schema for note creation."""
    id: str
    updated_at: float


class NoteUpdate(BaseModel):
    """Schema for note updates."""
    title: Optional[str] = None
    content: Optional[str] = None
    updated_at: Optional[float] = None


class NoteInDBBase(NoteBase):
    """Base schema for note in database."""
    id: str
    updated_at: float
    owner_id: str
    
    class Config:
        from_attributes = True


class Note(NoteInDBBase):
    """Note schema for API responses."""
    pass


class NoteInDB(NoteInDBBase):
    """Note schema as stored in database."""
    pass


class NoteSyncRequest(BaseModel):
    """Schema for note synchronization request."""
    notes: list[NoteCreate]
