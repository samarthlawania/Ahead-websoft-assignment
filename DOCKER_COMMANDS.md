# Docker Commands for Form Builder

## Start All Services
```bash
docker-compose up --build -d
```

## Start Individual Services
```bash
# Backend + Database
docker-compose up --build -d backend mongodb

# Frontend only
docker-compose up --build -d frontend

# All services
docker-compose up --build -d
```

## Management Commands
```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Restart service
docker-compose restart frontend
docker-compose restart backend

# Reset all data
docker-compose down -v
```

## Access URLs
- Frontend: http://localhost
- Backend API: http://localhost:3000
- MongoDB: localhost:27017

## Troubleshooting
```bash
# Check service status
docker-compose ps

# Rebuild specific service
docker-compose build frontend
docker-compose build backend

# Force recreate
docker-compose up --build --force-recreate -d
```