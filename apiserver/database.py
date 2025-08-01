from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
# config.pyからsettingsオブジェクトをインポート
from config import settings

# 設定オブジェクトから動的に生成されたDATABASE_URLを使用する
engine = create_async_engine(settings.DATABASE_URL)

AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db