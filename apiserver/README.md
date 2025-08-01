# DIVEIN API Server

DIVEIN API Server is a FastAPI-based backend service for the DIVEIN note-taking application. It provides OAuth2 authentication, note synchronization, and data persistence with support for both SQLite and PostgreSQL databases.

## 🚀 Features

- **OAuth2 Authentication**: Google and GitHub OAuth2 integration
- **Note Management**: Create, read, update, and sync notes
- **Database Support**: SQLite for development, PostgreSQL for production
- **CORS Support**: Cross-origin requests for frontend integration
- **JWT Tokens**: Secure authentication with JWT access tokens
- **Async Support**: Full async/await implementation with SQLAlchemy 2.0
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation

## 📋 Prerequisites

- Python 3.10+
- pip or uv for package management
- Git

### Optional (for PostgreSQL)
- PostgreSQL server
- Database client (psql, pgAdmin, etc.)

## 🛠 Installation

### 1. Clone the repository (if not already done)
```bash
git clone https://github.com/tamaki-uno/divein.git
cd divein/apiserver
```

### 2. Create and activate virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment setup

Choose the setup that matches your needs:

#### Quick Development Setup (Recommended)
```bash
cp .env.sqlite.example .env
```

#### Production Setup  
```bash
cp env.postgresql.example .env
```

#### Custom/Advanced Setup
```bash
cp .env.example .env
```

#### Minimal Testing (No OAuth setup required initially)
```bash
cp .env.template .env
```

### 5. Configure environment variables
Edit the `.env` file with your specific values:

- **Required**: `SECRET_KEY`, OAuth client credentials
- **Database**: Configure according to your chosen database type
- **Optional**: Adjust token expiration times

## 📁 Project Structure

```
apiserver/
├── app/
│   ├── api/v1/           # API endpoints
│   │   ├── auth.py       # OAuth2 authentication
│   │   ├── notes.py      # Note management
│   │   ├── users.py      # User information
│   │   └── api.py        # Router aggregation
│   ├── core/             # Core functionality
│   │   ├── config.py     # Configuration management
│   │   └── security.py   # JWT and OAuth2 security
│   ├── db/               # Database layer
│   │   └── database.py   # SQLAlchemy setup
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py       # User model
│   │   └── note.py       # Note model
│   ├── schemas/          # Pydantic schemas
│   │   ├── auth.py       # Authentication schemas
│   │   ├── user.py       # User schemas
│   │   └── note.py       # Note schemas
│   ├── services/         # Business logic
│   │   ├── oauth_service.py    # OAuth2 service
│   │   ├── user_service.py     # User operations
│   │   └── note_service.py     # Note operations
│   └── main.py           # FastAPI application
├── requirements.txt      # Python dependencies
├── .env.example         # Environment template (general)
├── .env.sqlite.example  # Environment template (SQLite)
├── env.postgresql.example # Environment template (PostgreSQL)
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SECRET_KEY` | JWT secret key for token signing | ✅ | - |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration time | ❌ | 10080 (1 week) |
| `DATABASE_TYPE` | Database type (`sqlite` or `postgresql`) | ❌ | `sqlite` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | ✅ | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | ✅ | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth2 client ID | ✅ | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth2 client secret | ✅ | - |

#### PostgreSQL Configuration (when `DATABASE_TYPE=postgresql`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `POSTGRES_USER` | PostgreSQL username | ✅ | - |
| `POSTGRES_PASSWORD` | PostgreSQL password | ✅ | - |
| `POSTGRES_SERVER` | PostgreSQL server host | ✅ | - |
| `POSTGRES_PORT` | PostgreSQL server port | ❌ | 5432 |
| `POSTGRES_DB` | PostgreSQL database name | ✅ | - |

## 🚀 Running the Server

### Development Mode
```bash
# Using Python directly
python3 app/main.py

# Using uvicorn (recommended)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The server will be available at:
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## 📚 API Endpoints

### Health Check
- `GET /` - Root health check
- `GET /health` - Detailed health check

### Authentication (`/api/v1/auth`)
- `POST /auth/google` - Authenticate with Google OAuth2
- `POST /auth/github` - Authenticate with GitHub OAuth2

### Users (`/api/v1/users`)
- `GET /users/me` - Get current user information

### Notes (`/api/v1/notes`)
- `GET /notes/` - Get all notes for the current user
- `POST /notes/sync` - Sync notes with client data

## 🔐 Authentication Flow

1. **Frontend**: Redirects user to OAuth2 provider (Google/GitHub)
2. **User**: Authorizes the application
3. **Frontend**: Receives authorization code from OAuth2 provider
4. **Frontend**: Sends code to `/api/v1/auth/{provider}` endpoint
5. **Backend**: Exchanges code for user information
6. **Backend**: Creates or retrieves user from database
7. **Backend**: Returns JWT access token
8. **Frontend**: Uses JWT token for subsequent API requests

## 💾 Database Schema

### Users Table
- `id` (String, Primary Key): Unique user identifier
- `provider` (String): OAuth2 provider ("google" or "github")
- `provider_id` (String, Unique): Provider-specific user ID
- `email` (String, Unique): User email address

### Notes Table
- `id` (String, Primary Key): Unique note identifier
- `title` (String): Note title
- `content` (String): Note content
- `updated_at` (Float): Unix timestamp of last update
- `owner_id` (String, Foreign Key): Reference to user ID

## 🧪 Testing

### Manual Testing
1. Start the server
2. Visit http://localhost:8000/docs
3. Use the interactive API documentation to test endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

## 🔧 Troubleshooting

### Common Issues

#### Import Errors
If you encounter `ModuleNotFoundError: No module named 'app'`:
```bash
# Make sure you're in the apiserver directory
cd /path/to/divein/apiserver

# Use uvicorn instead of direct Python execution
uvicorn app.main:app --reload
```

#### Database Connection Issues
For PostgreSQL connection problems:
1. Verify PostgreSQL server is running
2. Check connection parameters in `.env`
3. Ensure database exists and user has proper permissions

#### OAuth2 Setup
1. Create OAuth2 applications in Google Cloud Console and GitHub
2. Set redirect URIs correctly
3. Copy client ID and secret to `.env` file

### Debug Mode
Set environment variable for detailed error messages:
```bash
export FASTAPI_DEBUG=1
```

## 📦 Dependencies

### Core Dependencies
- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for FastAPI
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation using Python type annotations

### Database
- **aiosqlite**: Async SQLite adapter
- **asyncpg**: Async PostgreSQL adapter

### Authentication
- **python-jose**: JWT implementation
- **httpx**: HTTP client for OAuth2 requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

- **Frontend**: `/app` directory contains the Svelte frontend application
- **Documentation**: Check `/docs` for additional documentation

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Create an issue on the GitHub repository
