"""
API v1 router aggregation.
"""
from fastapi import APIRouter

from app.api.v1 import auth, notes, users
from app.core.config import settings


api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
