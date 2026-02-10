/**
 * Google OAuth Integration for Creomotion
 * 
 * Handles:
 * - OAuth 2.0 flow for user authentication
 * - Token storage and refresh
 * - Scope: drive.file (access only files app creates)
 */

import { google, Auth } from 'googleapis';
import { prisma } from './db';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// OAuth scopes - drive.file = access only to files created by the app
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',  // Per-file access only
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

/**
 * Create OAuth2 client for Google authentication
 */
export function createOAuth2Client(): Auth.OAuth2Client {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${APP_URL}/api/drive/callback`
  );
}

/**
 * Generate OAuth URL for user to authorize the app
 */
export function generateAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',  // Request refresh token
    scope: SCOPES,
    include_granted_scopes: true,
    prompt: 'consent',       // Force consent to always get refresh token
    state: state || '',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCode(code: string): Promise<{
  access_token: string;
  refresh_token: string | null;
  expiry_date: number;
  scope: string;
  email?: string;
}> {
  const oauth2Client = createOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error('No access token received');
  }

  // Get user email from Google
  let email: string | undefined;
  if (tokens.access_token) {
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    email = userInfo.data.email || undefined;
  }

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || null,
    expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
    scope: tokens.scope || SCOPES.join(' '),
    email,
  };
}

/**
 * Store Google Drive tokens in database
 */
export async function storeTokens(
  accessToken: string,
  refreshToken: string | null,
  expiresAt: Date,
  scope: string,
  email?: string
) {
  // Check if we already have tokens for this email
  const existing = email
    ? await prisma.googleDriveToken.findFirst({
        where: { email },
      })
    : null;

  if (existing) {
    return prisma.googleDriveToken.update({
      where: { id: existing.id },
      data: {
        accessToken,
        refreshToken: refreshToken || existing.refreshToken,
        expiresAt,
        scope,
        updatedAt: new Date(),
      },
    });
  }

  return prisma.googleDriveToken.create({
    data: {
      accessToken,
      refreshToken: refreshToken || '',
      expiresAt,
      scope,
      email: email || null,
    },
  });
}

/**
 * Get stored tokens from database
 */
export async function getStoredTokens(email?: string) {
  if (email) {
    return prisma.googleDriveToken.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Return most recent token
  return prisma.googleDriveToken.findFirst({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expiry_date: number }> {
  const oauth2Client = createOAuth2Client();

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token');
  }

  return {
    access_token: credentials.access_token,
    expiry_date: credentials.expiry_date || Date.now() + 3600 * 1000,
  };
}

/**
 * Get valid access token (refresh if expired)
 */
export async function getValidAccessToken(email?: string): Promise<string> {
  const stored = await getStoredTokens(email);

  if (!stored) {
    throw new Error('No Google Drive tokens found. Please authenticate first.');
  }

  // Check if token is expired or about to expire (5 min buffer)
  const isExpired = new Date(stored.expiresAt) < new Date(Date.now() + 5 * 60 * 1000);

  if (isExpired) {
    if (!stored.refreshToken) {
      throw new Error('Token expired and no refresh token available. Please re-authenticate.');
    }

    // Refresh the token
    const refreshed = await refreshAccessToken(stored.refreshToken);

    // Update stored tokens
    await prisma.googleDriveToken.update({
      where: { id: stored.id },
      data: {
        accessToken: refreshed.access_token,
        expiresAt: new Date(refreshed.expiry_date),
        updatedAt: new Date(),
      },
    });

    return refreshed.access_token;
  }

  return stored.accessToken;
}

/**
 * Revoke Google OAuth tokens
 */
export async function revokeTokens(tokenId: string): Promise<void> {
  const token = await prisma.googleDriveToken.findUnique({
    where: { id: tokenId },
  });

  if (!token) {
    throw new Error('Token not found');
  }

  // Revoke with Google
  const oauth2Client = createOAuth2Client();
  if (token.accessToken) {
    await oauth2Client.revokeToken(token.accessToken);
  }

  // Delete from database
  await prisma.googleDriveToken.delete({
    where: { id: tokenId },
  });
}

/**
 * Check if user has valid Google Drive connection
 */
export async function hasValidConnection(email?: string): Promise<boolean> {
  try {
    const token = await getValidAccessToken(email);
    return !!token;
  } catch {
    return false;
  }
}

/**
 * Create authenticated Drive API client
 */
export async function createDriveClient(email?: string) {
  const accessToken = await getValidAccessToken(email);
  const oauth2Client = createOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
}
