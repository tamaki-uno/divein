# DIVEIN API Reference

Complete API reference for the DIVEIN note-taking application.

## Base URL

```
Development: http://localhost:8000
Production: https://your-api-domain.com
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer your_jwt_token_here
```

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "data": {}, // Response data
  "message": "Success message", // Optional
  "timestamp": "2025-08-01T12:00:00Z"
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional details
  },
  "timestamp": "2025-08-01T12:00:00Z"
}
```

## Endpoints

### Authentication

#### POST /api/v1/auth/google

Authenticate using Google OAuth2.

**Request Body:**
```json
{
  "code": "google_oauth_authorization_code"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_string",
  "token_type": "bearer"
}
```

**Error Codes:**
- `401 UNAUTHORIZED` - Invalid or expired authorization code
- `422 UNPROCESSABLE_ENTITY` - Invalid request format

#### POST /api/v1/auth/github

Authenticate using GitHub OAuth2.

**Request Body:**
```json
{
  "code": "github_oauth_authorization_code"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_string", 
  "token_type": "bearer"
}
```

**Error Codes:**
- `401 UNAUTHORIZED` - Invalid or expired authorization code
- `422 UNPROCESSABLE_ENTITY` - Invalid request format

### Users

#### GET /api/v1/users/me

Get current authenticated user information.

**Headers:**
```http
Authorization: Bearer your_jwt_token
```

**Response:**
```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "provider": "google",
  "provider_id": "google_user_id"
}
```

**Error Codes:**
- `401 UNAUTHORIZED` - Invalid or expired token
- `404 NOT_FOUND` - User not found

### Notes

#### GET /api/v1/notes/

Get all notes for the authenticated user.

**Headers:**
```http
Authorization: Bearer your_jwt_token
```

**Query Parameters:**
- `skip` (integer, optional): Number of notes to skip (default: 0)
- `limit` (integer, optional): Maximum number of notes to return (default: 100)

**Example Request:**
```http
GET /api/v1/notes/?skip=0&limit=50
Authorization: Bearer your_jwt_token
```

**Response:**
```json
[
  {
    "id": "note_id_1",
    "title": "Note Title",
    "content": "Note content...",
    "updated_at": 1659369600.0,
    "owner_id": "user_uuid"
  },
  {
    "id": "note_id_2", 
    "title": "Another Note",
    "content": "More content...",
    "updated_at": 1659369700.0,
    "owner_id": "user_uuid"
  }
]
```

**Error Codes:**
- `401 UNAUTHORIZED` - Invalid or expired token
- `422 UNPROCESSABLE_ENTITY` - Invalid query parameters

#### POST /api/v1/notes/sync

Synchronize notes from client to server. This replaces all existing notes for the user.

**Headers:**
```http
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": [
    {
      "id": "note_id_1",
      "title": "Note Title",
      "content": "Note content...",
      "updated_at": 1659369600.0
    },
    {
      "id": "note_id_2",
      "title": "Another Note", 
      "content": "More content...",
      "updated_at": 1659369700.0
    }
  ]
}
```

**Response:**
```json
[
  {
    "id": "note_id_1",
    "title": "Note Title",
    "content": "Note content...",
    "updated_at": 1659369600.0,
    "owner_id": "user_uuid"
  },
  {
    "id": "note_id_2",
    "title": "Another Note",
    "content": "More content...",
    "updated_at": 1659369700.0,
    "owner_id": "user_uuid"
  }
]
```

**Error Codes:**
- `401 UNAUTHORIZED` - Invalid or expired token
- `422 UNPROCESSABLE_ENTITY` - Invalid note data format

### Health Check

#### GET /

Root endpoint providing API status.

**Response:**
```json
{
  "message": "DIVEIN API is running",
  "version": "1.0.0",
  "status": "healthy"
}
```

#### GET /health

Simple health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Data Models

### User
```json
{
  "id": "string (UUID)",
  "email": "string (email)",
  "provider": "string (google|github)",
  "provider_id": "string"
}
```

### Note
```json
{
  "id": "string (UUID)",
  "title": "string",
  "content": "string",
  "updated_at": "number (Unix timestamp)",
  "owner_id": "string (UUID)"
}
```

### Token
```json
{
  "access_token": "string (JWT)",
  "token_type": "string (bearer)"
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid request syntax |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Request validation failed |
| 500 | Internal Server Error - Server error occurred |

## Rate Limiting

Currently no rate limiting is implemented. This may be added in future versions.

## SDK Examples

### JavaScript/TypeScript

```javascript
class DiveinAPI {
  constructor(baseURL, token = null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async authGoogle(code) {
    return this.request('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  async authGithub(code) {
    return this.request('/api/v1/auth/github', {
      method: 'POST', 
      body: JSON.stringify({ code })
    });
  }

  // User
  async getCurrentUser() {
    return this.request('/api/v1/users/me');
  }

  // Notes
  async getNotes(skip = 0, limit = 100) {
    return this.request(`/api/v1/notes/?skip=${skip}&limit=${limit}`);
  }

  async syncNotes(notes) {
    return this.request('/api/v1/notes/sync', {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  }
}

// Usage
const api = new DiveinAPI('http://localhost:8000');

// Authenticate
const { access_token } = await api.authGoogle('auth_code');
api.setToken(access_token);

// Get notes
const notes = await api.getNotes();
console.log(notes);
```

### Python

```python
import requests
from typing import List, Dict, Optional

class DiveinAPI:
    def __init__(self, base_url: str, token: Optional[str] = None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()

    def set_token(self, token: str):
        self.token = token
        self.session.headers.update({'Authorization': f'Bearer {token}'})

    def request(self, endpoint: str, method: str = 'GET', **kwargs) -> Dict:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()

    # Authentication
    def auth_google(self, code: str) -> Dict:
        return self.request('/api/v1/auth/google', 'POST', json={'code': code})

    def auth_github(self, code: str) -> Dict:
        return self.request('/api/v1/auth/github', 'POST', json={'code': code})

    # User
    def get_current_user(self) -> Dict:
        return self.request('/api/v1/users/me')

    # Notes
    def get_notes(self, skip: int = 0, limit: int = 100) -> List[Dict]:
        return self.request(f'/api/v1/notes/?skip={skip}&limit={limit}')

    def sync_notes(self, notes: List[Dict]) -> List[Dict]:
        return self.request('/api/v1/notes/sync', 'POST', json={'notes': notes})

# Usage
api = DiveinAPI('http://localhost:8000')

# Authenticate
token_response = api.auth_google('auth_code')
api.set_token(token_response['access_token'])

# Get notes
notes = api.get_notes()
print(notes)
```

## Interactive Documentation

For interactive API testing and more detailed documentation, visit:

- **Swagger UI**: `http://localhost:8000/api/v1/docs`
- **ReDoc**: `http://localhost:8000/api/v1/redoc`

These interfaces allow you to test API endpoints directly from your browser.
