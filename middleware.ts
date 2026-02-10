import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge, COOKIE_NAME } from '@/lib/jwt-edge';
import type { UserRole } from '@/types';

// Route role requirements
const PROTECTED_ROUTES: { pattern: RegExp; roles: UserRole[] }[] = [
  { pattern: /^\/admin/, roles: ['ADMIN'] },
  { pattern: /^\/portal/, roles: ['ADMIN', 'EDITOR', 'CLIENT'] },
];

// Public routes that should always be accessible
const PUBLIC_ROUTES = [
  /^\/login/,
  /^\/api\/auth\/login/,
  /^\/_next\//,
  /^\/favicon\./,
];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Check if route is public
  if (PUBLIC_ROUTES.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  // Find matching protected route
  const protectedRoute = PROTECTED_ROUTES.find((route) =>
    route.pattern.test(pathname)
  );

  // If not a protected route, allow
  if (!protectedRoute) {
    return NextResponse.next();
  }

  // Get auth token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // No token - redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token (Edge-compatible)
  const payload = verifyTokenEdge(token);

  // Invalid token - redirect to login
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role access
  if (!protectedRoute.roles.includes(payload.role)) {
    // User doesn't have required role
    // For /admin, redirect to portal if they're a client/editor
    // Otherwise redirect to login
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // User is authenticated and authorized
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
