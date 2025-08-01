from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# +++ Userモデルを追加 +++
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True) # 内部で使うUUID
    provider = Column(String, nullable=False) # "google" or "github"
    provider_id = Column(String, unique=True, nullable=False, index=True) # 各プロバイダーのユーザーID
    email = Column(String, unique=True, index=True)
    
    # UserとNoteのリレーションシップ
    notes = relationship("Note", back_populates="owner")

class Note(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    updated_at = Column(Float)
    
    # +++ 所有者IDの列を追加 +++
    owner_id = Column(String, ForeignKey("users.id"))
    
    # NoteとUserのリレーションシップ
    owner = relationship("User", back_populates="notes")