from sqlalchemy import Column, String, Float
from .database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    updated_at = Column(Float)