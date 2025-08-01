"""
User service for business logic.
"""
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base_crud import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_provider_id(
        self, db: AsyncSession, *, provider: str, provider_id: str
    ) -> Optional[User]:
        """Get user by provider and provider_id."""
        result = await db.execute(
            select(User).filter_by(provider=provider, provider_id=provider_id)
        )
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        """Get user by email."""
        result = await db.execute(select(User).filter_by(email=email))
        return result.scalars().first()

    async def create_oauth_user(
        self,
        db: AsyncSession,
        *,
        provider: str,
        provider_id: str,
        email: str
    ) -> User:
        """Create a new user from OAuth provider."""
        user_data = UserCreate(
            provider=provider,
            provider_id=provider_id,
            email=email
        )
        
        # Create user with generated UUID
        db_user = User(
            id=str(uuid4()),
            **user_data.model_dump()
        )
        
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user


# Create CRUD instance
user = CRUDUser(User)
