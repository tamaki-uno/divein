from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from . import crud, models, schemas
from .database import engine, get_db

# --- アプリケーションインスタンス作成 ---
app = FastAPI()

# --- CORSミドルウェアの設定 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- データベース初期化 ---
@app.on_event("startup")
async def on_startup():
    """アプリケーション起動時にDBテーブルを作成する"""
    async with engine.begin() as conn:
        # await conn.run_sync(models.Base.metadata.drop_all) # テスト時に利用
        await conn.run_sync(models.Base.metadata.create_all)

# --- APIエンドポイント定義 ---
@app.post("/api/notes/sync", response_model=List[schemas.Note])
async def sync_notes_from_client(
    notes: List[schemas.Note], db: AsyncSession = Depends(get_db)
):
    """クライアントから送信されたメモリストで、サーバーのデータを同期する"""
    return await crud.sync_notes(db=db, notes=notes)


@app.get("/api/notes", response_model=List[schemas.Note])
async def get_notes_from_server(db: AsyncSession = Depends(get_db)):
    """サーバーに保存されているすべてのメモを返す"""
    return await crud.get_notes(db=db)