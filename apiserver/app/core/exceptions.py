"""
Custom exceptions for the DIVEIN API.
"""
from fastapi import HTTPException, status


class DiveinException(Exception):
    """Base exception for DIVEIN API."""
    pass


class AuthenticationError(DiveinException):
    """Authentication related errors."""
    pass


class AuthorizationError(DiveinException):
    """Authorization related errors."""
    pass


class NotFoundError(DiveinException):
    """Resource not found errors."""
    pass


class ValidationError(DiveinException):
    """Validation related errors."""
    pass


# HTTP Exceptions for FastAPI
class HTTPNotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class HTTPValidationError(HTTPException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class HTTPAuthenticationError(HTTPException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class HTTPAuthorizationError(HTTPException):
    def __init__(self, detail: str = "Not enough permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
