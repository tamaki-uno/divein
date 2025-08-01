"""
User schemas for API serialization.
"""
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user creation."""
    provider: str
    provider_id: str


class UserUpdate(UserBase):
    """Schema for user updates."""
    pass


class UserInDBBase(UserBase):
    """Base schema for user in database."""
    id: str
    provider: str
    provider_id: str
    
    class Config:
        from_attributes = True


class User(UserInDBBase):
    """User schema for API responses."""
    pass


class UserInDB(UserInDBBase):
    """User schema as stored in database."""
    pass
