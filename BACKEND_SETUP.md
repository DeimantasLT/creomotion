# Creomotion Backend - Quick Setup Guide

## ✅ What's Been Created

### Database Schema (`prisma/schema.prisma`)
- ✅ **User** - Authentication with password_hash, roles (ADMIN/EDITOR/VIEWER)
- ✅ **Client** - Client management
- ✅ **Project** - Project tracking with deadline and progress
- ✅ **Deliverable** - Files with Google Drive integration
- ✅ **TimeEntry** - Time tracking per project/user
- ✅ **Invoice** - Billing with status tracking
- ✅ **GoogleDriveToken** - OAuth token storage

### Library Files (`lib/`)
- ✅ `db.ts` - Prisma client singleton with connection
- ✅ `auth.ts` - JWT authentication utilities, middleware, password hashing
- ✅ `google-drive.ts` - Complete Google Drive integration (OAuth, upload, share, etc.)

### API Routes (`app/api/`)

#### Authentication
- ✅ `POST /api/auth/login` - JWT login with cookies
- ✅ `POST /api/auth/logout` - Clear session
- ✅ `GET /api/auth/me` - Current user

#### Users (CRUD + Admin-only controls)
- ✅ `GET /api/users` - List users
- ✅ `POST /api/users` - Create user
- ✅ `GET /api/users/[id]` - Get user
- ✅ `PUT /api/users/[id]` - Update user
- ✅ `DELETE /api/users/[id]` - Delete user

#### Clients (Full CRUD)
- ✅ All CRUD operations
- ✅ Search by name/email/company
- ✅ Include related projects

#### Projects (Full CRUD)
- ✅ All CRUD operations
- ✅ Filter by status/client
- ✅ Include deliverables, time entries, invoices

#### Deliverables (Full CRUD)
- ✅ All CRUD operations
- ✅ Google Drive URL/ID storage
- ✅ Version tracking

#### Time Entries (Full CRUD)
- ✅ All CRUD operations
- ✅ Duration calculation
- ✅ Self-only editing (unless admin)

#### Invoices (Full CRUD)
- ✅ All CRUD operations
- ✅ Status workflow (DRAFT → SENT → PAID)
- ✅ Unique invoice numbers

#### Google Drive Integration
- ✅ `GET /api/google-drive/auth` - Get OAuth URL
- ✅ `GET /api/google-drive/callback` - OAuth callback
- ✅ `GET /api/google-drive/status` - Connection status
- ✅ `GET /api/google-drive/files` - List files
- ✅ `POST /api/google-drive/files` - Create folder
- ✅ `POST /api/google-drive/upload` - Upload files
- ✅ `DELETE /api/google-drive/files` - Delete files
- ✅ `POST /api/google-drive/share` - Create public links
- ✅ `DELETE /api/google-drive/share` - Revoke access

### Migration & Seeding
- ✅ `prisma/migrations/20250210000000_init/migration.sql` - Complete SQL migration
- ✅ `prisma/seed.ts` - Sample data with users, clients, projects, etc.

## 🚀 Quick Start

### 1. Install Dependencies (if needed)
```bash
cd projects/creomotion
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL
# - JWT_SECRET (generate strong key)
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (for Drive)
```

### 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with sample data
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```

## 🔑 Default Login Credentials (after seeding)

- **Admin**: `admin@creomotion.com` / `admin123`
- **Editor**: `editor@creomotion.com` / `editor123`

## 📡 API Usage Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@creomotion.com","password":"admin123"}'
```

### Create Client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Cookie: creomotion_token=<your-token>" \
  -d '{"email":"client@test.com","name":"Test Client"}'
```

### Upload File to Google Drive
```bash
curl -X POST http://localhost:3000/api/google-drive/upload \
  -H "Cookie: creomotion_token=<your-token>" \
  -F "file=@/path/to/video.mp4"
```

## 🔐 JWT Authentication

All protected routes require authentication via:
- **Cookie**: `creomotion_token` (set automatically on login)
- **Header**: `Authorization: Bearer <token>`

## 📁 File Structure
```
projects/creomotion/
├── prisma/
│   ├── schema.prisma       # Complete database schema
│   ├── seed.ts             # Seed data
│   └── migrations/
│       └── 20250210000000_init/migration.sql
├── lib/
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # JWT utilities
│   └── google-drive.ts     # Drive integration
├── app/api/
│   ├── auth/               # Login/logout/me
│   ├── users/              # User CRUD
│   ├── clients/            # Client CRUD
│   ├── projects/           # Project CRUD
│   ├── deliverables/       # Deliverable CRUD
│   ├── time-entries/       # Time tracking CRUD
│   ├── invoices/           # Invoice CRUD
│   └── google-drive/       # Drive integration routes
├── .env.example            # Environment template
├── BACKEND.md              # Full API documentation
└── BACKEND_SETUP.md        # This file
```

## 🌐 Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Drive API**
4. Create **OAuth 2.0 credentials**
5. Add redirect URI: `http://localhost:3000/api/google-drive/callback`
6. Copy Client ID and Secret to `.env`

## 📊 API Summary

| Resource | Endpoints | Auth Required |
|----------|-----------|---------------|
| Auth | 3 | No (for login) |
| Users | 5 | Yes (Admin for list/create/delete) |
| Clients | 5 | Yes |
| Projects | 5 | Yes |
| Deliverables | 5 | Yes |
| Time Entries | 5 | Yes |
| Invoices | 5 | Yes |
| Google Drive | 7 | Yes |

**Total: 40 API endpoints**
