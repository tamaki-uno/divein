from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field

class Settings(BaseSettings):
    # .envファイルから読み込む環境変数を定義
    # デフォルトは "sqlite"
    DATABASE_TYPE: str = "sqlite"

    # PostgreSQL用の設定値（DATABASE_TYPEがpostgresqlの時のみ使われる）
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_DB: str = "app_db"

    # DATABASE_TYPEの値に基づいて、接続URLを動的に生成する
    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_TYPE == "postgresql":
            return (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:"
                f"{self.POSTGRES_PASSWORD}@"
                f"{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
            )
        # デフォルトはSQLite
        return "sqlite+aiosqlite:///./notes.db"

    # .envファイルを読み込む設定
    model_config = SettingsConfigDict(env_file=".env")

# 設定クラスのインスタンスを作成
settings = Settings()