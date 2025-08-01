"""
Import all schemas for easier access.
"""
from app.schemas.user import User, UserCreate, UserUpdate, UserInDB
from app.schemas.note import Note, NoteCreate, NoteUpdate, NoteInDB, NoteSyncRequest
from app.schemas.auth import Token, TokenData, OAuth2AuthRequest

__all__ = [
    "User", "UserCreate", "UserUpdate", "UserInDB",
    "Note", "NoteCreate", "NoteUpdate", "NoteInDB", "NoteSyncRequest",
    "Token", "TokenData", "OAuth2AuthRequest"
]
