# Developer Setup Guide

This guide will help you set up the DIVEIN API server for development.

## 🚀 Quick Setup (5 minutes)

### 1. Environment Setup

```bash
# Navigate to apiserver directory
cd apiserver

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (use your preferred editor)
nano .env  # or vim .env, code .env, etc.
```

**Minimum required changes in `.env`:**
- Change `SECRET_KEY` to a secure random string
- Configure OAuth credentials (see OAuth Setup section below)

### 3. Start Development Server

```bash
# Start with hot-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Or using Python module
python -m uvicorn app.main:app --reload
```

The API will be available at: http://localhost:8000

## 🔑 OAuth Setup

### Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (for frontend development)
   - Add your production domain when deploying
7. Copy Client ID and Client Secret to `.env`

### GitHub OAuth2

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - **Application name**: DIVEIN Development
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/auth/callback`
4. Copy Client ID and Client Secret to `.env`

## 📊 Database Setup

### SQLite (Default - No Setup Required)

SQLite is used by default and requires no additional setup. The database file will be created automatically at `./divein_notes.db`.

### PostgreSQL (Recommended for Production)

1. **Install PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS (using Homebrew)
   brew install postgresql
   
   # Windows: Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   # Switch to postgres user
   sudo -u postgres psql
   
   # Create database and user
   CREATE DATABASE divein_db;
   CREATE USER divein_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE divein_db TO divein_user;
   \q
   ```

3. **Update .env**:
   ```env
   DATABASE_TYPE=postgresql
   POSTGRES_USER=divein_user
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=divein_db
   ```

## 🧪 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### 2. API Documentation
Visit: http://localhost:8000/api/v1/docs

### 3. Test Authentication Flow
1. Visit the Swagger UI at http://localhost:8000/api/v1/docs
2. Try the `/api/v1/auth/google` endpoint
3. Use a valid Google authorization code

## 🛠️ Development Workflow

### Code Structure
```
app/
├── api/v1/          # API endpoints
├── core/            # Configuration and utilities  
├── db/              # Database connection and base CRUD
├── models/          # SQLAlchemy models
├── schemas/         # Pydantic schemas
├── services/        # Business logic
└── main.py          # FastAPI application
```

### Adding a New Feature

1. **Model** (if needed): Add to `app/models/`
2. **Schema**: Add to `app/schemas/`
3. **Service**: Add business logic to `app/services/`
4. **API Endpoint**: Add to `app/api/v1/`
5. **Register**: Add router to `app/api/v1/api.py`

### Code Style

- Follow PEP 8
- Use type hints everywhere
- Write docstrings for all functions and classes
- Use async/await for all I/O operations

## 🐛 Debugging

### Enable SQL Logging
In `.env`, set:
```env
DATABASE_ECHO=True
```

### Common Issues

1. **Import Errors**: Make sure you're in the `apiserver` directory and virtual environment is activated
2. **Database Connection**: Check PostgreSQL is running and credentials are correct
3. **OAuth Errors**: Verify client IDs and secrets are correct
4. **Port Conflicts**: Use a different port: `--port 8001`

### Logs
```bash
# Detailed logs with SQL queries
uvicorn app.main:app --reload --log-level debug
```

## 📦 Production Deployment

### Environment Variables
- Use environment-specific `.env` files
- Never commit `.env` files to version control
- Use secure secret keys and passwords

### Database
- Use PostgreSQL in production
- Set up database backups
- Use connection pooling

### Security
- Use HTTPS in production
- Set proper CORS origins
- Rotate secret keys regularly
- Monitor for security vulnerabilities

## 🔧 Useful Commands

```bash
# Install new package
pip install package_name
pip freeze > requirements.txt

# Database operations
python -c "from app.db.database import create_tables; import asyncio; asyncio.run(create_tables())"

# Generate secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Check API endpoints
python -c "from app.main import app; print([route.path for route in app.routes])"
```

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Async Tutorial](https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
