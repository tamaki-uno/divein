"""
User endpoints.
"""
from fastapi import APIRouter, Depends

from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas.user import User as UserSchema


router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information."""
    return current_user
