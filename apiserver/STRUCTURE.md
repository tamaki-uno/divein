# Project Structure Documentation

This document explains the architecture and organization of the DIVEIN API server.

## 📁 Directory Structure

```
apiserver/
├── app/                          # Main application package
│   ├── __init__.py              # Package initialization
│   ├── main.py                  # FastAPI application factory
│   │
│   ├── api/                     # API layer - HTTP endpoints
│   │   ├── __init__.py
│   │   └── v1/                  # API version 1
│   │       ├── __init__.py
│   │       ├── api.py           # Router aggregation
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── notes.py         # Notes CRUD endpoints
│   │       └── users.py         # User management endpoints
│   │
│   ├── core/                    # Core configuration and utilities
│   │   ├── __init__.py
│   │   ├── config.py            # Application settings
│   │   ├── security.py          # Authentication & JWT handling
│   │   └── exceptions.py        # Custom exception classes
│   │
│   ├── db/                      # Database layer
│   │   ├── __init__.py
│   │   ├── database.py          # DB connection and session management
│   │   └── base_crud.py         # Base CRUD operations
│   │
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── __init__.py          # Model exports
│   │   ├── user.py              # User model
│   │   └── note.py              # Note model
│   │
│   ├── schemas/                 # Pydantic schemas for API serialization
│   │   ├── __init__.py          # Schema exports
│   │   ├── auth.py              # Authentication request/response schemas
│   │   ├── user.py              # User data schemas
│   │   └── note.py              # Note data schemas
│   │
│   └── services/                # Business logic layer
│       ├── __init__.py
│       ├── user_service.py      # User business logic and CRUD
│       ├── note_service.py      # Note business logic and CRUD
│       └── oauth_service.py     # OAuth authentication logic
│
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── README.md                    # Main project documentation
├── DEVELOPMENT.md               # Developer setup guide
├── API_REFERENCE.md             # Complete API documentation
├── DEPLOYMENT.md                # Deployment guide
└── STRUCTURE.md                 # This file
```

## 🏗️ Architecture Patterns

### Clean Architecture

The project follows clean architecture principles with clear separation of concerns:

1. **Presentation Layer** (`api/`): HTTP endpoints and request/response handling
2. **Business Logic Layer** (`services/`): Core business rules and operations
3. **Data Access Layer** (`db/`, `models/`): Database operations and data models
4. **Configuration Layer** (`core/`): Application configuration and utilities

### Dependency Direction

Dependencies flow from outer layers to inner layers:
- API layer depends on Services layer
- Services layer depends on Data layer
- Core utilities can be used by any layer

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   API       │───▶│   Services   │───▶│   Models    │
│  (HTTP)     │    │ (Business)   │    │  (Data)     │
└─────────────┘    └──────────────┘    └─────────────┘
       │                    │                   │
       └────────────────────┼───────────────────┘
                            ▼
                   ┌─────────────┐
                   │    Core     │
                   │ (Config)    │
                   └─────────────┘
```

## 📄 File Responsibilities

### `app/main.py`
- FastAPI application factory
- Middleware configuration (CORS, etc.)
- Router registration
- Application lifecycle management
- Health check endpoints

### `app/api/v1/`
**Purpose**: HTTP request/response handling

- **`api.py`**: Aggregates all API routers for version 1
- **`auth.py`**: OAuth authentication endpoints (`/auth/google`, `/auth/github`)
- **`notes.py`**: Note management endpoints (`/notes/`, `/notes/sync`)
- **`users.py`**: User management endpoints (`/users/me`)

**Responsibilities**:
- Request validation using Pydantic schemas
- Response serialization
- HTTP status code management
- Error handling and formatting

### `app/core/`
**Purpose**: Application configuration and shared utilities

- **`config.py`**: 
  - Environment variable management
  - Database URL generation
  - OAuth client configuration
  - CORS settings

- **`security.py`**:
  - JWT token creation and validation
  - User authentication dependencies
  - OAuth2 scheme configuration

- **`exceptions.py`**:
  - Custom exception classes
  - HTTP exception helpers
  - Error code standardization

### `app/db/`
**Purpose**: Database abstraction layer

- **`database.py`**:
  - SQLAlchemy engine configuration
  - Session management
  - Database connection handling
  - Table creation utilities

- **`base_crud.py`**:
  - Generic CRUD operations
  - Base class for service-specific CRUD
  - Common database patterns

### `app/models/`
**Purpose**: Data model definitions

- **`user.py`**: User entity with OAuth provider information
- **`note.py`**: Note entity with content and metadata
- **`__init__.py`**: Exports all models for easy importing

**Model Relationships**:
```
User (1) ──── (Many) Note
   │
   └─ id, email, provider, provider_id
                      │
                      └─ owner_id (FK)
```

### `app/schemas/`
**Purpose**: API data validation and serialization

- **`auth.py`**: Authentication request/response formats
- **`user.py`**: User data transfer objects
- **`note.py`**: Note data transfer objects and sync requests
- **`__init__.py`**: Exports all schemas

**Schema Types**:
- **Base**: Common fields
- **Create**: For creation requests
- **Update**: For update requests (optional fields)
- **InDB**: Database representation
- **Response**: API response format

### `app/services/`
**Purpose**: Business logic implementation

- **`user_service.py`**:
  - User creation and lookup
  - OAuth user management
  - User-specific CRUD operations

- **`note_service.py`**:
  - Note synchronization logic
  - User-scoped note operations
  - Note CRUD with ownership validation

- **`oauth_service.py`**:
  - OAuth code exchange
  - Provider-specific user info retrieval
  - External API communication

## 🔄 Data Flow

### Authentication Flow
```
1. Frontend ──(OAuth Code)──▶ API (/auth/google)
2. API ──(Code)──▶ OAuth Service ──(User Info)──▶ User Service
3. User Service ──(User)──▶ Security ──(JWT)──▶ API ──(Token)──▶ Frontend
```

### Note Synchronization Flow
```
1. Frontend ──(Notes + JWT)──▶ API (/notes/sync)
2. API ──(Validate JWT)──▶ Security ──(User)──▶ Note Service
3. Note Service ──(Replace Notes)──▶ Database ──(Updated Notes)──▶ API
```

### Data Retrieval Flow
```
1. Frontend ──(JWT)──▶ API (/notes/)
2. API ──(Validate JWT)──▶ Security ──(User)──▶ Note Service
3. Note Service ──(Query by Owner)──▶ Database ──(Notes)──▶ API
```

## 🔧 Design Patterns

### Repository Pattern
- `services/` layer acts as repositories
- Encapsulates data access logic
- Provides clean interface for business operations

### Dependency Injection
- Uses FastAPI's dependency system
- Database sessions injected via `get_db()`
- User authentication via `get_current_user()`

### Factory Pattern
- `create_application()` in `main.py`
- Configurable application creation
- Easy testing and deployment

### Strategy Pattern
- Different OAuth providers handled uniformly
- Database types (SQLite/PostgreSQL) abstracted

## 🧪 Testing Strategy

### Unit Tests
```
tests/
├── test_services/       # Business logic tests
├── test_api/           # Endpoint tests
├── test_models/        # Model validation tests
└── conftest.py         # Test configuration
```

### Test Database
- Use separate test database
- Reset data between tests
- Mock external API calls (OAuth)

### Integration Tests
- Full request/response cycle
- Database operations
- Authentication flow

## 🚀 Scalability Considerations

### Horizontal Scaling
- Stateless design enables multiple instances
- JWT tokens don't require server-side storage
- Database connection pooling

### Performance Optimization
- Async/await throughout the stack
- Database query optimization
- Response caching (future enhancement)

### Monitoring
- Structured logging
- Health check endpoints
- Metrics collection (future enhancement)

## 🔄 Future Enhancements

### Planned Features
1. **Real-time Sync**: WebSocket support for live collaboration
2. **Caching Layer**: Redis for frequently accessed data
3. **Rate Limiting**: API usage limits per user
4. **Audit Logging**: Track all data changes
5. **Search**: Full-text search across notes
6. **File Attachments**: Support for file uploads

### Architecture Improvements
1. **Event-Driven Architecture**: Domain events for complex workflows
2. **CQRS**: Separate read/write models for performance
3. **Microservices**: Split into smaller, focused services
4. **GraphQL**: Alternative API interface

## 📚 Key Libraries and Their Roles

| Library | Purpose | Layer |
|---------|---------|-------|
| FastAPI | Web framework and API documentation | Presentation |
| Pydantic | Data validation and serialization | All layers |
| SQLAlchemy | ORM and database abstraction | Data |
| AsyncPG/Aiosqlite | Async database drivers | Data |
| Python-Jose | JWT token handling | Security |
| Httpx | External API communication | Services |
| Uvicorn | ASGI server | Infrastructure |

## 🔍 Code Quality

### Style Guidelines
- Follow PEP 8 for Python code style
- Use type hints throughout the codebase
- Write comprehensive docstrings
- Keep functions focused and small

### Code Organization
- One class per file in models and services
- Group related functionality in modules
- Use meaningful names for variables and functions
- Separate configuration from logic

### Error Handling
- Use specific exception types
- Provide meaningful error messages
- Log errors appropriately
- Return consistent error formats

This structure ensures maintainability, testability, and scalability while following modern Python and FastAPI best practices.
