# Creomotion Backend API Documentation

## Overview

Complete backend for Creomotion with PostgreSQL via Prisma, JWT authentication, and Google Drive integration.

## Database Schema

### Models

- **User** - Admin/Editor/Viewer accounts
- **Client** - Client information
- **Project** - Video projects linked to clients
- **Deliverable** - Project files/versions with Google Drive integration
- **TimeEntry** - Time tracking for projects
- **Invoice** - Billing and invoicing

### Enums

- `UserRole`: ADMIN, EDITOR, VIEWER
- `ProjectStatus`: DRAFT, IN_PROGRESS, IN_REVIEW, APPROVED, DELIVERED, ARCHIVED, CANCELLED
- `DeliverableStatus`: PENDING, IN_PROGRESS, IN_REVIEW, APPROVED, DELIVERED, REJECTED
- `InvoiceStatus`: DRAFT, SENT, VIEWED, PAID, OVERDUE, CANCELLED, REFUNDED

## API Routes

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout and clear session |
| GET | `/api/auth/me` | Get current user info |

**Login Request:**
```json
{
  "email": "admin@creomotion.com",
  "password": "admin123"
}
```

### Users

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/users` | List all users | Admin |
| POST | `/api/users` | Create user | Admin |
| GET | `/api/users/[id]` | Get user by ID | Self/Admin |
| PUT | `/api/users/[id]` | Update user | Self/Admin |
| DELETE | `/api/users/[id]` | Delete user | Admin |

### Clients

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create client |
| GET | `/api/clients/[id]` | Get client with projects |
| PUT | `/api/clients/[id]` | Update client |
| DELETE | `/api/clients/[id]` | Delete client |

**Query Parameters:**
- `search` - Search by name/email/company

### Projects

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/[id]` | Get project with relations |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |

**Query Parameters:**
- `status` - Filter by status
- `clientId` - Filter by client
- `search` - Search by name/description

### Deliverables

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/deliverables` | List all deliverables |
| POST | `/api/deliverables` | Create deliverable |
| GET | `/api/deliverables/[id]` | Get deliverable |
| PUT | `/api/deliverables/[id]` | Update deliverable |
| DELETE | `/api/deliverables/[id]` | Delete deliverable |

**Query Parameters:**
- `projectId` - Filter by project
- `status` - Filter by status

### Time Entries

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/time-entries` | List all time entries |
| POST | `/api/time-entries` | Create time entry |
| GET | `/api/time-entries/[id]` | Get time entry |
| PUT | `/api/time-entries/[id]` | Update time entry |
| DELETE | `/api/time-entries/[id]` | Delete time entry |

**Query Parameters:**
- `projectId` - Filter by project
- `userId` - Filter by user
- `startDate` - Filter from date
- `endDate` - Filter to date

### Invoices

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/invoices` | List all invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/[id]` | Get invoice |
| PUT | `/api/invoices/[id]` | Update invoice |
| DELETE | `/api/invoices/[id]` | Delete invoice |

**Query Parameters:**
- `projectId` - Filter by project
- `status` - Filter by status
- `search` - Search by invoice number

### Google Drive Integration

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/google-drive/auth` | Get OAuth URL |
| GET | `/api/google-drive/callback` | OAuth callback |
| GET | `/api/google-drive/status` | Check connection status |
| GET | `/api/google-drive/files` | List files |
| POST | `/api/google-drive/files` | Create folder |
| POST | `/api/google-drive/upload` | Upload file |
| DELETE | `/api/google-drive/files` | Delete file |
| POST | `/api/google-drive/share` | Create shareable link |
| DELETE | `/api/google-drive/share` | Revoke shareable link |

## Setup Instructions

### 1. Install Dependencies

```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/creomotion?schema=public"
JWT_SECRET="your-jwt-secret-key-min-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google-drive/callback"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

### 4. Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable Google Drive API
4. Create OAuth2 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/google-drive/callback`

## Authentication

All API routes (except login) require JWT authentication via cookie (`creomotion_token`) or Authorization header:

```
Authorization: Bearer <token>
```

## File Uploads

Upload files directly to Google Drive:

```bash
curl -X POST \
  -H "Cookie: creomotion_token=<token>" \
  -F "file=@/path/to/video.mp4" \
  -F "folderId=<optional-folder-id>" \
  http://localhost:3000/api/google-drive/upload
```

## Response Format

All responses use JSON:

**Success:**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
