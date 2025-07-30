from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List

from . import models, schemas

async def get_notes(db: AsyncSession) -> List[models.Note]:
    """すべてのノートをDBから取得する"""
    result = await db.execute(select(models.Note).order_by(models.Note.updated_at.desc()))
    return result.scalars().all()

async def sync_notes(db: AsyncSession, notes: List[schemas.Note]):
    """クライアントからのノートリストでDBを同期（全削除＆全挿入）する"""
    # 既存の全データを削除
    await db.execute(delete(models.Note))
    
    # 新しいノートデータを一括で作成
    db_notes = [models.Note(**note.model_dump()) for note in notes]
    db.add_all(db_notes)
    
    # 変更をコミット
    await db.commit()
    return db_notes