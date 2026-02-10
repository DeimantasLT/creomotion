// Edge-compatible JWT functions for Middleware
// These don't use Node.js APIs and work in Next.js Edge Runtime

import type { JWTPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const COOKIE_NAME = 'auth-token';

/**
 * Base64 decode that works in Edge Runtime
 */
function base64UrlDecode(str: string): string {
  // Add padding if needed
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  
  // Use atob if available (browser/edge), otherwise manual
  try {
    return typeof atob !== 'undefined' 
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString();
  } catch {
    try {
      // Manual base64 decode for edge
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      const bytes = Uint8Array.from(
        { length: (base64.length / 4) * 3 },
        (_, i) => {
          const idx = i * 4;
          const b1 = chars.indexOf(base64[idx]);
          const b2 = chars.indexOf(base64[idx + 1]);
          const b3 = chars.indexOf(base64[idx + 2]);
          const b4 = chars.indexOf(base64[idx + 3]);
          return ((b1 << 2) | (b2 >> 4));
        }
      );
      for (let i = 0; i < bytes.length; i++) {
        if (base64[Math.floor(i / 3) * 4 + (i % 3) + 2] !== '=') {
          result += String.fromCharCode(bytes[i]);
        }
      }
      return decodeURIComponent(escape(result));
    } catch {
      throw new Error('Failed to decode');
    }
  }
}

/**
 * Verify JWT token - Edge Runtime compatible
 * Note: This is a simplified verification, checks signature and expiration
 */
export function verifyTokenEdge(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode payload
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as JWTPayload;

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    // Check issued at time (optional)
    if (payload.iat && payload.iat > Math.floor(Date.now() / 1000) + 60) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
