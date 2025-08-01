# Deployment Guide

This guide covers different deployment options for the DIVEIN API server.

## 🐳 Docker Deployment (Recommended)

### Create Dockerfile

Create a `Dockerfile` in the `apiserver` directory:

```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose (Development)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_TYPE=postgresql
      - POSTGRES_USER=divein_user
      - POSTGRES_PASSWORD=divein_password
      - POSTGRES_SERVER=db
      - POSTGRES_DB=divein_db
      - SECRET_KEY=${SECRET_KEY}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - db
    volumes:
      - .:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=divein_user
      - POSTGRES_PASSWORD=divein_password
      - POSTGRES_DB=divein_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_TYPE=postgresql
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_SERVER=db
      - POSTGRES_DB=${POSTGRES_DB}
      - SECRET_KEY=${SECRET_KEY}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy Commands

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api

# Scale the API service
docker-compose up -d --scale api=3
```

## ☁️ Cloud Deployment

### Railway

1. **Connect Repository**:
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the `apiserver` folder as root

2. **Environment Variables**:
   Set these in Railway dashboard:
   ```
   DATABASE_TYPE=postgresql
   SECRET_KEY=your-secure-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Add PostgreSQL**:
   - Add PostgreSQL service in Railway
   - It will automatically set `DATABASE_URL`

4. **Deploy**:
   - Railway auto-deploys on git push
   - Your API will be available at `https://your-app.railway.app`

### Heroku

1. **Install Heroku CLI**:
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Others: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**:
   ```bash
   heroku create your-divein-api
   heroku addons:create heroku-postgresql:mini
   ```

3. **Configure Environment**:
   ```bash
   heroku config:set SECRET_KEY=your-secure-secret-key
   heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
   heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret
   heroku config:set DATABASE_TYPE=postgresql
   ```

4. **Create Procfile**:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

### AWS (ECS with Fargate)

1. **Build and Push Docker Image**:
   ```bash
   # Build image
   docker build -t divein-api .
   
   # Tag for ECR
   docker tag divein-api:latest your-account.dkr.ecr.region.amazonaws.com/divein-api:latest
   
   # Push to ECR
   docker push your-account.dkr.ecr.region.amazonaws.com/divein-api:latest
   ```

2. **Create ECS Task Definition**:
   ```json
   {
     "family": "divein-api",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "divein-api",
         "image": "your-account.dkr.ecr.region.amazonaws.com/divein-api:latest",
         "portMappings": [
           {
             "containerPort": 8000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "DATABASE_TYPE",
             "value": "postgresql"
           }
         ],
         "secrets": [
           {
             "name": "SECRET_KEY",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:divein/secret-key"
           }
         ]
       }
     ]
   }
   ```

## 🌐 Production Considerations

### Reverse Proxy (Nginx)

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://api/health;
            access_log off;
        }
    }
}
```

### SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Environment Security

1. **Secret Management**:
   ```bash
   # Generate secure secret key
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # Use environment variables, never hardcode secrets
   export SECRET_KEY="your-generated-key"
   ```

2. **Database Security**:
   - Use strong passwords
   - Enable SSL connections
   - Restrict database access by IP
   - Regular backups

3. **API Security**:
   - Use HTTPS in production
   - Set proper CORS origins
   - Rate limiting (consider using nginx-rate-limit)
   - Monitor for suspicious activity

### Monitoring and Logging

1. **Health Checks**:
   ```python
   # Add to app/api/v1/health.py
   @router.get("/detailed")
   async def detailed_health_check(db: AsyncSession = Depends(get_db)):
       try:
           # Check database connection
           await db.execute(select(1))
           return {
               "status": "healthy",
               "database": "connected",
               "timestamp": datetime.utcnow()
           }
       except Exception as e:
           raise HTTPException(500, detail="Database connection failed")
   ```

2. **Logging Configuration**:
   ```python
   # Add to app/core/config.py
   import logging
   
   # Configure logging
   logging.basicConfig(
       level=logging.INFO,
       format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
   )
   ```

3. **Metrics (Optional)**:
   ```bash
   # Add prometheus metrics
   pip install prometheus-fastapi-instrumentator
   ```

### Database Backup

```bash
# PostgreSQL backup script
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="divein_db"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump $DB_NAME > $BACKUP_DIR/divein_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "divein_backup_*.sql" -mtime +7 -delete
```

### Performance Optimization

1. **Database Indexing**:
   ```sql
   -- Add indexes for frequently queried fields
   CREATE INDEX idx_notes_owner_id ON notes(owner_id);
   CREATE INDEX idx_notes_updated_at ON notes(updated_at);
   CREATE INDEX idx_users_provider_id ON users(provider, provider_id);
   ```

2. **Connection Pooling**:
   ```python
   # In app/db/database.py
   engine = create_async_engine(
       settings.DATABASE_URL,
       pool_size=20,
       max_overflow=0,
       pool_pre_ping=True,
       pool_recycle=300
   )
   ```

3. **Caching** (Redis - Optional):
   ```bash
   # Add Redis for caching
   pip install redis aioredis
   ```

## 🔍 Monitoring

### Application Monitoring

1. **Sentry** (Error Tracking):
   ```bash
   pip install sentry-sdk[fastapi]
   ```
   
   ```python
   # In app/main.py
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration
   
   sentry_sdk.init(
       dsn="your-sentry-dsn",
       integrations=[FastApiIntegration()]
   )
   ```

2. **Application Logs**:
   ```bash
   # View logs in production
   docker-compose logs -f api
   
   # Tail logs from specific container
   docker logs -f container_name
   ```

### Infrastructure Monitoring

- Use tools like Datadog, New Relic, or Grafana
- Monitor CPU, memory, disk usage
- Set up alerts for high error rates
- Monitor API response times

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All environment variables configured
- [ ] Database backups tested
- [ ] SSL certificates obtained
- [ ] OAuth applications configured for production domains
- [ ] Security headers configured
- [ ] Health checks working

### Post-deployment
- [ ] API endpoints responding correctly
- [ ] Authentication flow working
- [ ] Database connections stable
- [ ] Logs being generated properly
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented

### Regular Maintenance
- [ ] Monitor application logs
- [ ] Check database performance
- [ ] Update dependencies regularly
- [ ] Rotate secret keys periodically
- [ ] Review and update security settings
