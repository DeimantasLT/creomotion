# 🚀 Creomotion Platform - Quickstart Guide

## Prerequisites

- Docker Desktop (Windows/Mac) OR Docker + Docker Compose (Linux)
- Node.js 18+ (for local development outside Docker)
- Google Cloud account (for Drive integration)

## Phase 1: Environment Setup (5 minutes)

```bash
# Clone the project (when ready)
# cd creomotion

# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - NEXTAUTH_SECRET: Run `openssl rand -base64 32` or any random string
# - GOOGLE_SERVICE_ACCOUNT_KEY: Your Google service account JSON
# - GOOGLE_DRIVE_FOLDER_ID: Your Drive folder ID
```

## Phase 2: Google Drive Setup (10 minutes)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project named "Creomotion"
   - Enable "Google Drive API"

2. **Create Service Account**
   - IAM & Admin → Service Accounts → Create
   - Grant "Editor" role
   - Create JSON key → Download
   - Copy key content into `GOOGLE_SERVICE_ACCOUNT_KEY` in .env

3. **Prepare Drive Folder**
   - Create folder "Creomotion Clients" in Google Drive
   - Get folder ID from URL: `drive/folders/FOLDER_ID`
   - Share folder with service account email (found in JSON key)

## Phase 3: Launch (2 minutes)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down

# Full reset (wipes data)
docker-compose down -v
```

## Development URLs

| Service | URL | Purpose |
|---------|-----|---------|
| App | http://localhost:3000 | Main application |
| Database | localhost:5432 | PostgreSQL direct access |
| Redis | localhost:6379 | Cache direct access |
| PGAdmin | http://localhost:5050 | Database GUI (dev profile) |
| Redis Commander | http://localhost:8081 | Redis GUI (dev profile) |

## Database Commands

```bash
# Generate Prisma client
docker-compose exec app npx prisma generate

# Run migrations
docker-compose exec app npx prisma migrate dev

# Open Prisma Studio (GUI)
docker-compose exec app npx prisma studio

# Seed database
docker-compose exec app npx prisma db seed
```

## Common Tasks

### Add a new dependency
```bash
docker-compose exec app npm install package-name
```

### View database schema
```bash
# Via PGAdmin (http://localhost:5050)
# Login: admin@creomotion.local / admin
# Add server: host=db, port=5432, database=creomotion, user=postgres, pass=postgres
```

### Reset everything
```bash
docker-compose down -v  # Remove volumes (data)
docker-compose up -d     # Fresh start
```

## Troubleshooting

### Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection refused
```bash
# Wait for healthcheck, then restart app
docker-compose restart app
```

### Prisma client not found
```bash
docker-compose exec app npx prisma generate
```

## Production Deployment Checklist

- [ ] Change `NEXTAUTH_SECRET` to cryptographically secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure production email service (Resend/SendGrid)
- [ ] Set up Inngest for background jobs
- [ ] Enable Google Drive webhooks for sync
- [ ] Configure backup for PostgreSQL
- [ ] Set up monitoring (Sentry, Logtail)
- [ ] Configure CDN for static assets
- [ ] SSL certificates configured
- [ ] Rate limiting enabled

## Architecture Overview

```
┌─────────────────┐
│   Next.js App   │  ← Port 3000
│   (Monolith)    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│PostgreSQL│ │ Redis  │
│  5432  │ │  6379  │
└────────┘ └────────┘
    │         │
    └────┬────┘
         │
    ┌────┴──────────────┐
    ▼                   ▼
┌────────────┐  ┌──────────────┐
│Google Drive│  │Email Service │
└────────────┘  └──────────────┘
```

## Next Steps

After Docker is running, the Backend Lead will implement:
1. Google Drive service integration
2. Authentication flows (NextAuth + Portal tokens)
3. Core API endpoints
4. PDF generation services

See `ARCHITECTURE.md` for full system design.
