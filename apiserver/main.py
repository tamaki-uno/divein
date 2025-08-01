import httpx
from datetime import timedelta, datetime
from typing import List, Dict

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

# 相対インポートを絶対インポートに変更
import crud
import models
import schemas
from config import settings
from database import engine, get_db

# FastAPIインスタンス作成
app = FastAPI()

# --- 認証関連 ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # tokenUrlはダミー

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.get(models.User, user_id)
    if user is None:
        raise credentials_exception
    return user


# --- 認証エンドポイント ---
@app.post("/auth/google", response_model=Dict[str, str])
async def auth_google(code_body: Dict[str, str], db: AsyncSession = Depends(get_db)):
    """Googleの認証コードを受け取り、JWTを返す"""
    code = code_body.get("code")
    token_url = "https://oauth2.googleapis.com/token"
    async with httpx.AsyncClient() as client:
        # 認証コードをアクセストークンに交換
        token_res = await client.post(token_url, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": "http://localhost:5173/auth/callback", # フロントエンドのコールバックURL
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()
        
        # ユーザー情報を取得
        userinfo_res = await client.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={
            "Authorization": f"Bearer {token_data['access_token']}"
        })
        user_info = userinfo_res.json()

    # DBにユーザーが存在するか確認、なければ作成
    user = await crud.get_user_by_provider_id(db, "google", user_info["sub"])
    if not user:
        user = await crud.create_user(db, "google", user_info["sub"], user_info["email"])
    
    # 独自のJWTを生成して返す
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token}


# --- 保護されたAPIエンドポイント ---
# +++ get_current_userをDependsに追加 +++
@app.post("/api/notes/sync", response_model=List[schemas.Note])
async def sync_notes_from_client(
    notes: List[schemas.Note], 
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # +++ CRUD関数にcurrent_user.idを渡す +++
    return await crud.sync_notes(db=db, notes=notes, owner_id=current_user.id)

# +++ get_current_userをDependsに追加 +++
@app.get("/api/notes", response_model=List[schemas.Note])
async def get_notes_from_server(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # +++ CRUD関数にcurrent_user.idを渡す +++
    return await crud.get_notes(db=db, owner_id=current_user.id)

# 開発用の起動コード
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)