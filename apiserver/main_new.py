"""
Entry point for the DIVEIN API server.
"""
from app.main import app

# Export the app for uvicorn
__all__ = ["app"]
