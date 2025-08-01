"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.core.exceptions import AuthenticationError
from app.db.database import get_db
from app.schemas.auth import Token, OAuth2AuthRequest
from app.services.oauth_service import oauth2_service
from app.services.user_service import user


router = APIRouter()


@router.post("/google", response_model=Token)
async def auth_google(
    auth_request: OAuth2AuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate with Google OAuth2."""
    try:
        user_info = await oauth2_service.exchange_google_code(auth_request.code)
        
        # Get or create user
        db_user = await user.get_by_provider_id(
            db, provider="google", provider_id=user_info["sub"]
        )
        
        if not db_user:
            db_user = await user.create_oauth_user(
                db,
                provider="google",
                provider_id=user_info["sub"],
                email=user_info["email"]
            )
        
        # Create access token
        access_token = create_access_token(subject=db_user.id)
        
        return Token(access_token=access_token)
        
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.post("/github", response_model=Token)
async def auth_github(
    auth_request: OAuth2AuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate with GitHub OAuth2."""
    try:
        user_info = await oauth2_service.exchange_github_code(auth_request.code)
        
        # Get or create user
        db_user = await user.get_by_provider_id(
            db, provider="github", provider_id=str(user_info["id"])
        )
        
        if not db_user:
            db_user = await user.create_oauth_user(
                db,
                provider="github",
                provider_id=str(user_info["id"]),
                email=user_info.get("email", f"{user_info['login']}@github.local")
            )
        
        # Create access token
        access_token = create_access_token(subject=db_user.id)
        
        return Token(access_token=access_token)
        
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
