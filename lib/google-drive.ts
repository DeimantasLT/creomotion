/**
 * Google Drive File Management for Creomotion
 * 
 * Handles:
 * - Upload files to project-specific folders
 * - List files in folder
 * - Generate signed download/view URLs
 * - Version control handling
 */

import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { createDriveClient, getValidAccessToken, createOAuth2Client } from './google-oauth';
import { prisma } from './db';

// Re-export auth functions for API routes
export { generateAuthUrl as getAuthUrl, exchangeCode as getTokensFromCode, storeTokens as saveTokens, getStoredTokens } from './google-oauth';

// Constants
const DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const DEFAULT_SIGNED_URL_EXPIRY = 15 * 60; // 15 minutes in seconds

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  description?: string;
  version?: number;
}

export interface DriveFolder {
  id: string;
  name: string;
  createdTime: string;
  webViewLink?: string;
}

export interface UploadResult {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink?: string;
  size: number;
  mimeType: string;
  version: number;
}

// ============================================
// FOLDER MANAGEMENT
// ============================================

/**
 * Create or get project folder in Google Drive
 * 
 * Folder structure: Creomotion Clients > Client Name > Project Name
 */
export async function getOrCreateProjectFolder(
  projectId: string,
  projectName: string,
  clientName: string,
  parentFolderId?: string
): Promise<string> {
  const drive = await createDriveClient();

  // Check if folder already exists for this project
  const existingFolder = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true }, // We'll add driveFolderId to schema if needed
  });

  // Search for existing folder by name in parent
  const query = parentFolderId
    ? `mimeType='${DRIVE_FOLDER_MIME_TYPE}' and name='${escapeQueryString(projectName)}' and '${parentFolderId}' in parents and trashed=false`
    : `mimeType='${DRIVE_FOLDER_MIME_TYPE}' and name='${escapeQueryString(projectName)}' and trashed=false`;

  const existing = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }

  // Create new folder
  const fileMetadata: drive_v3.Schema$File = {
    name: projectName,
    mimeType: DRIVE_FOLDER_MIME_TYPE,
    parents: parentFolderId ? [parentFolderId] : undefined,
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink',
  });

  if (!folder.data.id) {
    throw new Error('Failed to create folder');
  }

  return folder.data.id;
}

/**
 * Create client root folder
 */
export async function getOrCreateClientFolder(
  clientId: string,
  clientName: string,
  rootFolderId?: string
): Promise<string> {
  const drive = await createDriveClient();

  const folderName = sanitizeFolderName(clientName);

  // Check if folder exists
  const query = rootFolderId
    ? `mimeType='${DRIVE_FOLDER_MIME_TYPE}' and name='${escapeQueryString(folderName)}' and '${rootFolderId}' in parents and trashed=false`
    : `mimeType='${DRIVE_FOLDER_MIME_TYPE}' and name='${escapeQueryString(folderName)}' and trashed=false`;

  const existing = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }

  // Create new folder
  const fileMetadata: drive_v3.Schema$File = {
    name: folderName,
    mimeType: DRIVE_FOLDER_MIME_TYPE,
    parents: rootFolderId ? [rootFolderId] : undefined,
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink',
  });

  if (!folder.data.id) {
    throw new Error('Failed to create client folder');
  }

  return folder.data.id;
}

/**
 * Create project subfolders for organization
 */
export async function createProjectSubfolders(
  projectFolderId: string
): Promise<Record<string, string>> {
  const drive = await createDriveClient();

  const subfolders = ['01_PreProduction', '02_Production', '03_PostProduction', '04_Deliverables'];
  const created: Record<string, string> = {};

  for (const name of subfolders) {
    // Check if exists
    const query = `mimeType='${DRIVE_FOLDER_MIME_TYPE}' and name='${name}' and '${projectFolderId}' in parents and trashed=false`;
    const existing = await drive.files.list({
      q: query,
      fields: 'files(id)',
    });

    if (existing.data.files && existing.data.files.length > 0) {
      created[name] = existing.data.files[0].id!;
    } else {
      const folder = await drive.files.create({
        requestBody: {
          name,
          mimeType: DRIVE_FOLDER_MIME_TYPE,
          parents: [projectFolderId],
        },
        fields: 'id',
      });
      created[name] = folder.data.id!;
    }
  }

  return created;
}

// ============================================
// FILE UPLOAD
// ============================================

/**
 * Upload file to Google Drive project folder
 */
export async function uploadFile(
  folderId: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  metadata?: { description?: string; projectId?: string }
): Promise<UploadResult> {
  const drive = await createDriveClient();

  // Create file metadata
  const fileMetadata: drive_v3.Schema$File = {
    name: fileName,
    parents: [folderId],
    description: metadata?.description,
    appProperties: metadata?.projectId
      ? { projectId: metadata.projectId }
      : undefined,
  };

  // Upload file
  const media = {
    mimeType,
    body: bufferToStream(fileBuffer),
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, name, size, mimeType, webViewLink, webContentLink, version',
  });

  if (!file.data.id) {
    throw new Error('Failed to upload file');
  }

  return {
    id: file.data.id,
    name: file.data.name || fileName,
    webViewLink: file.data.webViewLink || '',
    webContentLink: file.data.webContentLink || undefined,
    size: parseInt(file.data.size || '0', 10),
    mimeType: file.data.mimeType || mimeType,
    version: file.data.version ? parseInt(file.data.version.toString(), 10) : 1,
  };
}

/**
 * Upload file with resumable upload for large files
 */
export async function initiateResumableUpload(
  folderId: string,
  fileName: string,
  mimeType: string,
  fileSize: number,
  metadata?: { description?: string; projectId?: string }
): Promise<{ uploadUrl: string; fileId?: string }> {
  const accessToken = await getValidAccessToken();

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
    description: metadata?.description,
    appProperties: metadata?.projectId
      ? { projectId: metadata.projectId }
      : undefined,
  };

  // Request resumable upload URL
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': fileSize.toString(),
      },
      body: JSON.stringify(fileMetadata),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to initiate upload: ${response.statusText}`);
  }

  const uploadUrl = response.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('No upload URL received');
  }

  return { uploadUrl };
}

// ============================================
// FILE LISTING
// ============================================

/**
 * List files in a folder
 */
export async function listFiles(
  folderId: string,
  options?: {
    pageSize?: number;
    pageToken?: string;
    orderBy?: string;
  }
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const drive = await createDriveClient();

  const query = `'${folderId}' in parents and trashed=false`;

  const response = await drive.files.list({
    q: query,
    pageSize: options?.pageSize || 100,
    pageToken: options?.pageToken,
    orderBy: options?.orderBy || 'modifiedTime desc',
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink, description, version)',
    spaces: 'drive',
  });

  const files = (response.data.files || []).map((file): DriveFile => ({
    id: file.id!,
    name: file.name || 'Unnamed',
    mimeType: file.mimeType || 'application/octet-stream',
    size: file.size || '0',
    modifiedTime: file.modifiedTime || new Date().toISOString(),
    webViewLink: file.webViewLink || undefined,
    webContentLink: file.webContentLink || undefined,
    thumbnailLink: file.thumbnailLink || undefined,
    description: file.description || undefined,
    version: file.version ? parseInt(file.version.toString(), 10) : 1,
  }));

  return {
    files,
    nextPageToken: response.data.nextPageToken || undefined,
  };
}

/**
 * Search files by name within a folder
 */
export async function searchFiles(
  folderId: string,
  query: string
): Promise<DriveFile[]> {
  const drive = await createDriveClient();

  const searchQuery = `'${folderId}' in parents and name contains '${escapeQueryString(query)}' and trashed=false`;

  const response = await drive.files.list({
    q: searchQuery,
    fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink, description, version)',
    spaces: 'drive',
  });

  return (response.data.files || []).map((file): DriveFile => ({
    id: file.id!,
    name: file.name || 'Unnamed',
    mimeType: file.mimeType || 'application/octet-stream',
    size: file.size || '0',
    modifiedTime: file.modifiedTime || new Date().toISOString(),
    webViewLink: file.webViewLink || undefined,
    webContentLink: file.webContentLink || undefined,
    thumbnailLink: file.thumbnailLink || undefined,
    description: file.description || undefined,
    version: file.version ? parseInt(file.version.toString(), 10) : 1,
  }));
}

// ============================================
// FILE ACCESS & DOWNLOAD URLs
// ============================================

/**
 * Get file metadata
 */
export async function getFile(fileId: string): Promise<DriveFile> {
  const drive = await createDriveClient();

  const file = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink, description, version',
  });

  if (!file.data.id) {
    throw new Error('File not found');
  }

  return {
    id: file.data.id,
    name: file.data.name || 'Unnamed',
    mimeType: file.data.mimeType || 'application/octet-stream',
    size: file.data.size || '0',
    modifiedTime: file.data.modifiedTime || new Date().toISOString(),
    webViewLink: file.data.webViewLink || undefined,
    webContentLink: file.data.webContentLink || undefined,
    thumbnailLink: file.data.thumbnailLink || undefined,
    description: file.data.description || undefined,
    version: file.data.version ? parseInt(file.data.version.toString(), 10) : 1,
  };
}

/**
 * Generate secure download URL for file
 * 
 * Returns a proxy URL that handles auth server-side instead of exposing tokens in URL.
 * Client should use /api/drive/download?fileId=XXX endpoint which proxies the request.
 */
export async function generateDownloadUrl(
  fileId: string,
  expiryMinutes: number = 15
): Promise<{ url: string; expiresAt: Date; fileId: string; mimeType?: string }> {
  const drive = await createDriveClient();

  // Get file metadata (no token exposure)
  const file = await drive.files.get({
    fileId,
    fields: 'mimeType, name, webContentLink',
  });

  // Return proxy URL - actual download happens through server endpoint
  // This avoids exposing access_token in browser history, logs, or referer headers
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Client calls /api/drive/download?fileId=...&expires=...
  // Server verifies auth, then proxies with proper Authorization header
  return {
    url: `/api/drive/download?fileId=${encodeURIComponent(fileId)}&expires=${expiresAt.toISOString()}`,
    expiresAt,
    fileId,
    mimeType: file.data.mimeType || undefined,
  };
}

/**
 * Get file stream for proxying downloads through server
 * Used by /api/drive/download endpoint to serve files without exposing tokens
 */
export async function getFileStream(
  fileId: string
): Promise<{ stream: Readable; filename: string; mimeType: string }> {
  const accessToken = await getValidAccessToken();
  const drive = await createDriveClient();

  // Get file metadata
  const file = await drive.files.get({
    fileId,
    fields: 'name, mimeType',
  });

  const mimeType = file.data.mimeType || 'application/octet-stream';
  const filename = file.data.name || 'download';

  // Determine download URL
  let downloadUrl: string;
  if (mimeType.includes('application/vnd.google-apps')) {
    // Google Workspace files need export
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?alt=media`;
  } else {
    // Binary files
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  // Fetch with Authorization header (secure, not exposed to client)
  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body from Drive API');
  }

  // Convert fetch response to Node.js Readable stream
  const webStream = response.body;
  const stream = new Readable();

  // Pipe the web stream to Node.js stream
  stream._read = () => {};

  const reader = webStream.getReader();
  const pump = async (): Promise<void> => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          stream.push(null);
          break;
        }
        stream.push(value);
      }
    } catch (err) {
      stream.destroy(err as Error);
    }
  };

  pump().catch((err) => stream.destroy(err));

  return { stream, filename, mimeType };
}

/**
 * Generate view URL for video streaming (Google Drive player)
 */
export async function generateViewUrl(fileId: string): Promise<string> {
  const drive = await createDriveClient();

  const file = await drive.files.get({
    fileId,
    fields: 'webViewLink',
  });

  return file.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Create temporary access permission for client
 * This creates a viewer permission that's cleaned up after access
 */
export async function createTemporaryPermission(
  fileId: string,
  email: string,
  role: 'reader' | 'commenter' = 'reader'
): Promise<string> {
  const drive = await createDriveClient();

  const permission = await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'user',
      role,
      emailAddress: email,
    },
    sendNotificationEmail: false,
    fields: 'id',
  });

  return permission.data.id || '';
}

/**
 * Remove permission from file
 */
export async function removePermission(
  fileId: string,
  permissionId: string
): Promise<void> {
  const drive = await createDriveClient();

  await drive.permissions.delete({
    fileId,
    permissionId,
  });
}

// ============================================
// VERSION CONTROL
// ============================================

/**
 * Get file versions/revisions
 */
export async function getFileVersions(fileId: string): Promise<
  Array<{
    id: string;
    modifiedTime: string;
    modifiedBy: string;
    size: string;
    keepForever: boolean;
  }>
> {
  const drive = await createDriveClient();

  const revisions = await drive.revisions.list({
    fileId,
    fields: 'revisions(id, modifiedTime, lastModifyingUser, size, keepForever)',
  });

  return (revisions.data.revisions || []).map((rev) => ({
    id: rev.id!,
    modifiedTime: rev.modifiedTime || '',
    modifiedBy: rev.lastModifyingUser?.displayName || 'Unknown',
    size: rev.size || '0',
    keepForever: rev.keepForever || false,
  }));
}

/**
 * Keep a revision forever
 */
export async function keepRevisionForever(
  fileId: string,
  revisionId: string
): Promise<void> {
  const drive = await createDriveClient();

  await drive.revisions.update({
    fileId,
    revisionId,
    requestBody: {
      keepForever: true,
    },
  });
}

/**
 * Create new version of existing file (upload and replace)
 */
export async function createNewVersion(
  fileId: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<UploadResult> {
  const drive = await createDriveClient();

  const media = {
    mimeType,
    body: bufferToStream(fileBuffer),
  };

  const file = await drive.files.update({
    fileId,
    media,
    fields: 'id, name, size, mimeType, webViewLink, webContentLink, version',
  });

  if (!file.data.id) {
    throw new Error('Failed to update file');
  }

  return {
    id: file.data.id,
    name: file.data.name || 'Unnamed',
    webViewLink: file.data.webViewLink || '',
    webContentLink: file.data.webContentLink || undefined,
    size: parseInt(file.data.size || '0', 10),
    mimeType: file.data.mimeType || mimeType,
    version: file.data.version ? parseInt(file.data.version.toString(), 10) : 1,
  };
}

// ============================================
// FILE OPERATIONS
// ============================================

/**
 * Delete file (move to trash)
 */
export async function deleteFile(fileId: string): Promise<void> {
  const drive = await createDriveClient();

  await drive.files.update({
    fileId,
    requestBody: {
      trashed: true,
    },
  });
}

/**
 * Permanently delete file
 */
export async function permanentlyDeleteFile(fileId: string): Promise<void> {
  const drive = await createDriveClient();

  await drive.files.delete({
    fileId,
  });
}

/**
 * Copy file to another folder
 */
export async function copyFile(
  fileId: string,
  destinationFolderId: string,
  newName?: string
): Promise<string> {
  const drive = await createDriveClient();

  const copy = await drive.files.copy({
    fileId,
    requestBody: {
      parents: [destinationFolderId],
      name: newName,
    },
    fields: 'id',
  });

  return copy.data.id || '';
}

/**
 * Move file to different folder
 */
export async function moveFile(
  fileId: string,
  newFolderId: string,
  previousFolderId: string
): Promise<void> {
  const drive = await createDriveClient();

  await drive.files.update({
    fileId,
    addParents: newFolderId,
    removeParents: previousFolderId,
    fields: 'id, parents',
  });
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  fileId: string,
  metadata: { name?: string; description?: string }
): Promise<void> {
  const drive = await createDriveClient();

  await drive.files.update({
    fileId,
    requestBody: metadata,
    fields: 'id',
  });
}

// ============================================
// UTILITIES
// ============================================

/**
 * Convert Buffer to Readable Stream
 */
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Escape special characters in search query
 */
function escapeQueryString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Sanitize folder name for Google Drive
 */
function sanitizeFolderName(name: string): string {
  // Remove characters not allowed in file names
  return name
    .replace(/[<>"/\\|?*]/g, '_')
    .trim()
    .substring(0, 255) || 'Untitled';
}

/**
 * Check if file is a video (for streaming optimization)
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Check if file is an image (for thumbnail previews)
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Get appropriate icon for file type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('folder')) return 'folder';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  return 'file';
}

// Alias exports for API route compatibility
export { getOrCreateProjectFolder as createFolder };

/**
 * Create shareable link for a file with real expiration tracking
 * 
 * WARNING: Google Drive permissions are permanent until explicitly revoked.
 * We store the permission ID and expiration time to allow cleanup via cron job.
 * 
 * TODO: Implement scheduled cleanup with Inngest or cron to revoke expired links
 * Example: Check for expired links every hour and call revokeShareableLink()
 */
export async function createShareableLink(
  fileId: string,
  expiresInMinutes: number = 60
): Promise<{ url: string; expiresAt: Date; permissionId: string }> {
  const drive = await createDriveClient();

  // Check if 'anyone' permission already exists
  const existingPerms = await drive.permissions.list({
    fileId,
    fields: 'permissions(id, type)',
  });

  let permissionId: string | null = null;
  const existingAnyone = existingPerms.data.permissions?.find(
    (p) => p.type === 'anyone'
  );

  if (existingAnyone?.id) {
    // Reuse existing permission
    permissionId = existingAnyone.id;
  } else {
    // Create new 'anyone' permission
    const permission = await drive.permissions.create({
      fileId,
      requestBody: {
        type: 'anyone',
        role: 'reader',
      },
      fields: 'id',
    });
    permissionId = permission.data.id || null;
  }

  if (!permissionId) {
    throw new Error('Failed to create or find shareable permission');
  }

  // Get the file's web view link
  const file = await drive.files.get({
    fileId,
    fields: 'webViewLink, webContentLink',
  });

  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  // TODO: Store permissionId + expiresAt in database for scheduled cleanup
  // Example: await prisma.fileShare.create({ data: { fileId, permissionId, expiresAt } });

  return {
    url: file.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
    expiresAt,
    permissionId,
  };
}

/**
 * Revoke shareable link by removing 'anyone' permission
 */
export async function revokeShareableLink(fileId: string): Promise<void> {
  const drive = await createDriveClient();

  // Find the 'anyone' permission
  const permissions = await drive.permissions.list({
    fileId,
    fields: 'permissions(id, type)',
  });

  const anyonePermission = permissions.data.permissions?.find(
    (p) => p.type === 'anyone'
  );

  if (anyonePermission?.id) {
    await drive.permissions.delete({
      fileId,
      permissionId: anyonePermission.id,
    });
  }
}
