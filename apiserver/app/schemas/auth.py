"""
Authentication schemas.
"""
from pydantic import BaseModel


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token data schema."""
    user_id: str


class OAuth2AuthRequest(BaseModel):
    """OAuth2 authentication request schema."""
    code: str
