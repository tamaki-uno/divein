from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field

class Settings(BaseSettings):
    # ... 既存のDB設定 ...
    DATABASE_TYPE: str = "sqlite"
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_DB: str = "app_db"

    # +++ 認証関連の設定を追加 +++
    SECRET_KEY: str = "your_super_secret_key" # JWTの署名に使うキー
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7日間

    # +++ OAuthクライアント設定を追加 +++
    GOOGLE_CLIENT_ID: str = "your_google_client_id"
    GOOGLE_CLIENT_SECRET: str = "your_google_client_secret"
    GITHUB_CLIENT_ID: str = "your_github_client_id"
    GITHUB_CLIENT_SECRET: str = "your_github_client_secret"

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