# DIVEIN API Server

A modern, scalable FastAPI-based REST API server for the DIVEIN note-taking application.

## 🏗️ Architecture Overview

The API server follows a clean architecture pattern with clear separation of concerns:

```
apiserver/
├── app/                          # Main application package
│   ├── api/                      # API layer
│   │   └── v1/                   # API version 1
│   │       ├── auth.py           # Authentication endpoints
│   │       ├── notes.py          # Notes CRUD endpoints
│   │       ├── users.py          # User management endpoints
│   │       └── api.py            # Router aggregation
│   ├── core/                     # Core configurations and utilities
│   │   ├── config.py             # Application settings
│   │   ├── security.py           # Authentication & authorization
│   │   └── exceptions.py         # Custom exceptions
│   ├── db/                       # Database layer
│   │   ├── database.py           # Database connection and session
│   │   └── base_crud.py          # Base CRUD operations
│   ├── models/                   # SQLAlchemy models
│   │   ├── user.py               # User model
│   │   ├── note.py               # Note model
│   │   └── __init__.py           # Model exports
│   ├── schemas/                  # Pydantic schemas
│   │   ├── user.py               # User schemas
│   │   ├── note.py               # Note schemas
│   │   ├── auth.py               # Authentication schemas
│   │   └── __init__.py           # Schema exports
│   ├── services/                 # Business logic layer
│   │   ├── user_service.py       # User business logic
│   │   ├── note_service.py       # Note business logic
│   │   └── oauth_service.py      # OAuth authentication logic
│   └── main.py                   # FastAPI application factory
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- pip or pipenv for package management

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/tamaki-uno/divein.git
   cd divein/apiserver
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.sqlite.example .env
   # Edit .env file with your configuration
   ```

5. **Start the server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

The API will be available at `http://localhost:8000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `apiserver` directory with the following variables:

```env
# Database Configuration
DATABASE_TYPE=sqlite  # or "postgresql"

# For PostgreSQL (if using)
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=divein_db

# Authentication
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Database Options

#### SQLite (Default)
- **Pros**: Zero configuration, great for development
- **Cons**: Single connection, not suitable for production
- **Usage**: Default setting, no additional setup required

#### PostgreSQL (Recommended for Production)
- **Pros**: Robust, scalable, supports concurrent connections
- **Cons**: Requires separate PostgreSQL installation
- **Setup**:
  1. Install PostgreSQL
  2. Create database: `createdb divein_db`
  3. Set `DATABASE_TYPE=postgresql` in `.env`
  4. Configure PostgreSQL connection variables

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/google` - Google OAuth2 authentication
- `POST /api/v1/auth/github` - GitHub OAuth2 authentication

### Users
- `GET /api/v1/users/me` - Get current user information

### Notes
- `GET /api/v1/notes/` - Get all notes for authenticated user
- `POST /api/v1/notes/sync` - Synchronize notes from client

### Health Check
- `GET /` - Root endpoint with API status
- `GET /health` - Health check endpoint

## 🔒 Authentication Flow

1. **Frontend redirects to OAuth provider** (Google/GitHub)
2. **User authorizes application** at OAuth provider
3. **OAuth provider redirects back** with authorization code
4. **Frontend sends code to API** (`/auth/google` or `/auth/github`)
5. **API exchanges code for user info** with OAuth provider
6. **API creates/finds user** in database
7. **API returns JWT token** to frontend
8. **Frontend includes JWT** in `Authorization: Bearer <token>` header for protected endpoints

## 🛠️ Development

### Project Structure Principles

1. **Layered Architecture**: Clear separation between API, business logic, and data layers
2. **Dependency Injection**: Using FastAPI's dependency system for database sessions and authentication
3. **Type Safety**: Comprehensive type hints throughout the codebase
4. **Error Handling**: Consistent error responses using custom exceptions
5. **Documentation**: Auto-generated OpenAPI/Swagger documentation

### Adding New Features

1. **Create Model** in `app/models/`
2. **Create Schema** in `app/schemas/`
3. **Create Service** in `app/services/`
4. **Create API Endpoint** in `app/api/v1/`
5. **Register Router** in `app/api/v1/api.py`

### Database Migrations

For schema changes, you can use Alembic (recommended for production):

```bash
# Install alembic
pip install alembic

# Initialize alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Description of change"

# Apply migration
alembic upgrade head
```

## 🔍 API Documentation

Once the server is running, you can access:

- **Interactive API Documentation (Swagger UI)**: http://localhost:8000/api/v1/docs
- **Alternative API Documentation (ReDoc)**: http://localhost:8000/api/v1/redoc
- **OpenAPI JSON Schema**: http://localhost:8000/api/v1/openapi.json

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/
```

## 🐳 Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t divein-api .
docker run -p 8000:8000 divein-api
```

## 📊 Performance Considerations

- **Async/Await**: All database operations are asynchronous
- **Connection Pooling**: SQLAlchemy's async session management
- **Response Caching**: Consider adding Redis for frequently accessed data
- **Database Indexing**: Ensure proper indexes on frequently queried fields

## 🔧 Troubleshooting

### Common Issues

1. **Import Errors**: Ensure you're running from the correct directory and virtual environment is activated
2. **Database Connection**: Check your database configuration in `.env`
3. **OAuth Issues**: Verify your OAuth client credentials and redirect URIs
4. **Port Conflicts**: Use a different port if 8000 is occupied: `--port 8001`

### Logs

Enable detailed logging by setting `echo=True` in database configuration for SQL query logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the established patterns
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MPL-2.0 License - see the [LICENSE](../LICENSE) file for details.
