# Environment Configuration Files Summary

## Available Environment Templates

| File | Purpose | Database | Best For |
|------|---------|----------|----------|
| `.env.template` | Minimal testing | SQLite | Quick testing without OAuth |
| `.env.sqlite.example` | Development | SQLite | Local development |
| `env.postgresql.example` | Production | PostgreSQL | Production deployment |
| `.env.example` | Full configuration | Both | Advanced/custom setups |

## Quick Start Guide

### 1. For Development (Fastest)
```bash
cp .env.sqlite.example .env
# Edit OAuth credentials
uvicorn app.main:app --reload
```

### 2. For Production
```bash
cp env.postgresql.example .env
# Configure database and OAuth
# Deploy with proper WSGI server
```

### 3. For Quick Testing
```bash
cp .env.template .env
# No OAuth needed initially
uvicorn app.main:app --reload
```

## Key Features of New Configuration

### Unified Structure
- All templates follow the same variable structure
- Clear separation between required and optional settings
- Consistent commenting and documentation

### Environment-Specific Presets
- **Development**: SQLite, debug enabled, relaxed CORS
- **Production**: PostgreSQL, security optimized, strict CORS
- **Template**: Minimal config for quick testing

### Easy Migration
- Same variable names across all templates
- Clear upgrade path from development to production
- No breaking changes to existing configurations

## OAuth Setup Required

All configurations require OAuth credentials from:
- **Google**: https://console.cloud.google.com/apis/credentials
- **GitHub**: https://github.com/settings/applications/new

## Security Notes

- **SECRET_KEY**: Must be changed in production (use `openssl rand -hex 32`)
- **Database passwords**: Use strong passwords for production
- **CORS origins**: Specify exact domains for production
- **Token expiration**: Shorter for production (24h vs 1 week)

## Files Organization

```
apiserver/
├── .env.example          # Full configuration with all options
├── .env.sqlite.example   # Development-optimized (SQLite)
├── env.postgresql.example # Production-optimized (PostgreSQL)
├── .env.template         # Minimal testing template
└── ENV_GUIDE.md         # This file
```
