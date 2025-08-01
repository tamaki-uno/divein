"""
User model.
"""
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    provider = Column(String, nullable=False)  # "google" or "github"
    provider_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # Relationships
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")
