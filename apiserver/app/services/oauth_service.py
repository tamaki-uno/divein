"""
OAuth authentication service.
"""
import httpx
from typing import Dict, Any

from app.core.config import settings
from app.core.security import AuthenticationError


class OAuth2Service:
    """Service for OAuth2 authentication."""
    
    @staticmethod
    async def exchange_google_code(code: str) -> Dict[str, Any]:
        """Exchange Google authorization code for user info."""
        token_url = "https://oauth2.googleapis.com/token"
        
        async with httpx.AsyncClient() as client:
            # Exchange code for access token
            token_response = await client.post(token_url, data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": "http://localhost:5173/auth/callback",
                "grant_type": "authorization_code",
            })
            
            if token_response.status_code != 200:
                raise AuthenticationError("Failed to exchange code for token")
            
            token_data = token_response.json()
            
            # Get user info
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            
            if userinfo_response.status_code != 200:
                raise AuthenticationError("Failed to get user info")
            
            return userinfo_response.json()
    
    @staticmethod
    async def exchange_github_code(code: str) -> Dict[str, Any]:
        """Exchange GitHub authorization code for user info."""
        token_url = "https://github.com/login/oauth/access_token"
        
        async with httpx.AsyncClient() as client:
            # Exchange code for access token
            token_response = await client.post(
                token_url,
                data={
                    "code": code,
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                },
                headers={"Accept": "application/json"}
            )
            
            if token_response.status_code != 200:
                raise AuthenticationError("Failed to exchange code for token")
            
            token_data = token_response.json()
            
            # Get user info
            userinfo_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            
            if userinfo_response.status_code != 200:
                raise AuthenticationError("Failed to get user info")
            
            return userinfo_response.json()


# Create service instance
oauth2_service = OAuth2Service()
