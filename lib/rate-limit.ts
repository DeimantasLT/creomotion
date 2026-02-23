// Simple in-memory rate limiter for API routes
// Note: This resets on container restart - use Redis for production

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetTime) {
      rateLimits.delete(key);
    }
  }
}, 60000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimits.get(key);
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
    rateLimits.set(key, entry);
  }
  
  entry.count++;
  
  const remaining = Math.max(0, limit - entry.count);
  const resetIn = Math.max(0, entry.resetTime - now);
  
  return {
    success: entry.count <= limit,
    remaining,
    resetIn,
  };
}

// Rate limiter middleware helper
export function withRateLimit(
  req: Request,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  // Use IP + path as identifier
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const path = new URL(req.url).pathname;
  const identifier = `${ip}:${path}`;
  
  return checkRateLimit(identifier, limit, windowMs);
}
