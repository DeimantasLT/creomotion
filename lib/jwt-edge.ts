// Edge-compatible JWT functions for Middleware
// Uses 'jose' library for proper cryptographic signature verification

import { jwtVerify } from 'jose';
import type { JWTPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const secret = new TextEncoder().encode(JWT_SECRET);
export const COOKIE_NAME = 'auth-token';

/**
 * Verify JWT token - Edge Runtime compatible with full signature verification
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as JWTPayload['role'],
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
