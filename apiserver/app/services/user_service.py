"""
User service for business logic.
"""
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_provider_id(
    db: AsyncSession, provider: str, provider_id: str
) -> Optional[User]:
    """Get user by provider and provider_id."""
    result = await db.execute(
        select(User).filter_by(provider=provider, provider_id=provider_id)
    )
    return result.scalars().first()


async def create_oauth_user(
    db: AsyncSession, provider: str, provider_id: str, email: str
) -> User:
    """Create a new user from OAuth provider."""
    db_user = User(
        id=str(uuid4()),
        provider=provider,
        provider_id=provider_id,
        email=email
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
