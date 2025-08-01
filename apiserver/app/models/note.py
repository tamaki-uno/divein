"""
Note model.
"""
from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Note(Base):
    """Note model for storing user notes."""
    __tablename__ = "notes"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    updated_at = Column(Float, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="notes")
