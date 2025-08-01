from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from uuid import uuid4

import models, schemas

# +++ User関連のCRUDを追加 +++
async def get_user_by_provider_id(db: AsyncSession, provider: str, provider_id: str):
    result = await db.execute(
        select(models.User).filter_by(provider=provider, provider_id=provider_id)
    )
    return result.scalars().first()

async def create_user(db: AsyncSession, provider: str, provider_id: str, email: str):
    db_user = models.User(
        id=str(uuid4()), 
        provider=provider, 
        provider_id=provider_id, 
        email=email
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# --- Note関連のCRUDを修正 ---
# +++ owner_idを引数に取るように変更 +++
async def get_notes(db: AsyncSession, owner_id: str) -> List[models.Note]:
    """指定された所有者のノートをすべて取得する"""
    result = await db.execute(
        select(models.Note)
        .filter_by(owner_id=owner_id) # +++ この条件を追加
        .order_by(models.Note.updated_at.desc())
    )
    return result.scalars().all()

# +++ owner_idを引数に取るように変更 +++
async def sync_notes(db: AsyncSession, notes: List[schemas.Note], owner_id: str):
    """指定された所有者のノートを同期する"""
    # 既存のデータを削除（指定された所有者のもののみ）
    await db.execute(delete(models.Note).filter_by(owner_id=owner_id)) # +++ この条件を追加
    
    # 新しいノートデータを作成
    db_notes = [models.Note(**note.model_dump(), owner_id=owner_id) for note in notes] # +++ owner_idを追加
    db.add_all(db_notes)
    
    await db.commit()
    return db_notes