# Google Drive Integration Setup Guide

This guide covers the setup and configuration of Google Drive API integration for Creomotion file management.

## Overview

The Google Drive integration provides:
- **OAuth 2.0 authentication** with `drive.file` scope (access only to files the app creates)
- **Project-based folder structure** for organizing client deliverables
- **File upload, download, and version control**
- **Client portal access** with secure download URLs
- **File comments and approval workflows**

## Prerequisites

1. Google Cloud Platform project
2. Google Drive API enabled
3. OAuth 2.0 credentials configured
4. PostgreSQL database (for token storage)

## Setup Steps

### 1. Google Cloud Console Configuration

#### Enable Google Drive API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create your project
3. Navigate to **APIs & Services > Library**
4. Search for "Google Drive API" and click **Enable**

#### Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** (or Internal if Google Workspace)
3. Fill in app information:
   - App name: "Creomotion"
   - User support email: your email
   - Developer contact email: your email
4. Add scopes:
   - `drive.file` (Create, edit, delete only the files you create)
   - `userinfo.email` (View email address)
   - `userinfo.profile` (View profile)
5. Add test users (during development)
6. Submit for verification (required for production)

#### Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Application type: **Web application**
4. Name: "Creomotion Web Client"
5. Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
6. Authorized redirect URIs:
   - `http://localhost:3000/api/drive/callback`
   - `https://your-domain.com/api/drive/callback`
7. Click **Create**
8. Download the JSON or note down:
   - **Client ID**
   - **Client Secret**

### 2. Environment Configuration

Add these variables to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# App URL (used for OAuth callbacks)
APP_URL=http://localhost:3000
# For production:
# APP_URL=https://your-domain.com
```

### 3. Database Setup

The integration uses the `GoogleDriveToken` table already defined in your Prisma schema:

```prisma
model GoogleDriveToken {
  id           String   @id @default(uuid())
  accessToken  String   @map("access_token")
  refreshToken String   @map("refresh_token")
  expiresAt    DateTime @map("expires_at")
  scope        String?
  email        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([email])
  @@map("google_drive_tokens")
}
```

Run migration if needed:
```bash
npm run db:migrate
```

### 4. Initial OAuth Authentication

1. Navigate to **Admin Settings** in the app
2. Click **Connect Google Drive**
3. Complete OAuth flow with Google
4. Tokens are securely stored in the database

Or manually trigger via API:
```bash
curl http://localhost:3000/api/drive/auth
```

## API Reference

### Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/drive/auth` | GET | Get Google OAuth URL | Admin |
| `/api/drive/callback` | GET | OAuth callback handler | - |

### Folders

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/drive/folders?folderId=xxx` | GET | List folders | Admin/Editor/Viewer |
| `/api/drive/folders` | POST | Create client/project folder | Admin/Editor |

**Create folder body:**
```json
{
  "type": "client|project",
  "clientId": "uuid",
  "clientName": "Client Name",
  "projectId": "uuid",
  "projectName": "Project Name",
  "parentFolderId": "optional-google-folder-id"
}
```

### Files

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/drive/files?folderId=xxx` | GET | List files | Admin/Editor/Viewer |
| `/api/drive/files?fileId=xxx` | GET | Get file metadata | Admin/Editor/Viewer |
| `/api/drive/files` | POST | Upload file | Admin/Editor |
| `/api/drive/files/[fileId]` | PATCH | Update file | Admin/Editor |
| `/api/drive/files/[fileId]` | DELETE | Delete file | Admin |

**Direct upload (multipart/form-data):**
```bash
curl -X POST http://localhost:3000/api/drive/files \
  -F "file=@/path/to/file.mp4" \
  -F "folderId=google-folder-id" \
  -F "projectId=project-uuid" \
  -F "description=Optional description"
```

**Initiate resumable upload (for large files):**
```json
POST /api/drive/files
{
  "folderId": "google-folder-id",
  "fileName": "large-video.mp4",
  "mimeType": "video/mp4",
  "fileSize": 1073741824,
  "projectId": "project-uuid"
}
```

Returns upload URL for PUT requests to Google.

### Versions

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/drive/files/versions?fileId=xxx` | GET | List versions | Admin/Editor/Viewer |
| `/api/drive/files/versions` | POST | Create new version | Admin/Editor |
| `/api/drive/files/versions` | PATCH | Keep revision forever | Admin |

### Download/View

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/drive/download?fileId=xxx&type=download` | GET | Get download URL | Admin/Editor/Viewer/Client |
| `/api/drive/download?fileId=xxx&type=view` | GET | Get view/stream URL | Admin/Editor/Viewer/Client |

### Status Updates

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/drive/status?deliverableId=xxx` | GET | Get deliverable status | Admin/Editor/Viewer |
| `/api/drive/status` | POST | Update status | Admin/Editor/Client |

**Status update body:**
```json
{
  "deliverableId": "uuid",
  "status": "IN_REVIEW|APPROVED|REJECTED|DELIVERED",
  "comment": "Optional comment",
  "clientEmail": "client@example.com" // For client auth
}
```

### Client Portal

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/drive/portal?clientId=xxx` | GET | List client files | Portal Token |
| `/api/drive/portal` | POST | Request file access | Portal Token |

### Comments

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/drive/comments?deliverableId=xxx` | GET | Get comments | Admin/Editor/Viewer/Client |
| `/api/drive/comments` | POST | Add comment | Admin/Editor/Client |

## Folder Structure

The integration creates this folder structure in Google Drive:

```
[Root Folder - Your Google Drive or Shared Drive]
├── Client A Company/
│   ├── Project 1 Website Redesign/
│   │   ├── 01_PreProduction/
│   │   ├── 02_Production/
│   │   ├── 03_PostProduction/
│   │   └── 04_Deliverables/
│   └── Project 2 Commercial/
│       ├── 01_PreProduction/
│       ├── 02_Production/
│       ├── 03_PostProduction/
│       └── 04_Deliverables/
└── Client B Startup/
    └── Product Launch Video/
```

## Client Access Patterns

### Read-Only Approved Files
Clients can only access files with status `APPROVED` or `DELIVERED`.

### In-Review Comments
For files with `IN_REVIEW` status:
- Clients can add comments
- Clients can approve or request changes
- Access expires after deliverable status changes

### Video Streaming
Video files use Google Drive's embedded player for streaming (no storage cost to your servers).

## Security

### OAuth Scope: `drive.file`
This scope only grants access to files created by the app. Benefits:
- Users cannot see existing files in Drive
- Only app-created files are accessible
- Security scope is minimal

### Token Storage
- Access tokens stored in PostgreSQL
- Refresh tokens rotated automatically
- Tokens expire and refresh every 60 minutes

### Download URLs
- Generated URLs expire (default: 15 minutes for admins, 60 minutes for clients)
- URLs include access tokens that expire
- Clients get temporary file permissions

### Access Control
- **Admin**: Full CRUD access
- **Editor**: Upload, update, comment
- **Viewer**: Read-only access
- **Client**: Access only their project's approved files

## Webhook Integration (Optional)

To sync external Drive changes, set up:

1. **Google Drive Webhook**
   - Configure push notifications
   - Endpoint: `/api/webhooks/google-drive`
   - Updates file metadata in database

2. **Polling Fallback**
   - Background job checks for changes
   - Updates database records

## Troubleshooting

### Token Expired
Tokens automatically refresh. If issues occur:
1. Re-authenticate via `/api/drive/auth`
2. Check database for token records

### Upload Fails
1. Verify OAuth connection is active
2. Check file size limits (1GB for resumable upload recommended)
3. Ensure folder exists

### Client Cannot Access
1. Verify deliverable status is `APPROVED` or `DELIVERED`
2. Check client portal token is valid
3. Ensure file exists in Google Drive

### Rate Limits
Google Drive API quotas:
- 10,000 queries/day for non-Google Workspace
- 1,000,000 queries/day for paid Workspace

Monitor in Google Cloud Console > Quotas.

## Development

### Testing OAuth Locally
Use `ngrok` or similar to expose localhost:
```bash
ngrok http 3000
# Update Google Cloud redirect URI to ngrok URL
```

### Mock Mode
For development without Google credentials:
```typescript
// Add to .env
MOCK_DRIVE=true
```

This returns mock responses without calling Google APIs.

## Support

- [Google Drive API Docs](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- Creomotion Issues: Create issue in project repository
