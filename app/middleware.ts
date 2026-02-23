import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const start = Date.now();
  const requestId = request.headers.get('x-request-id') || Math.random().toString(36).substring(7);
  
  // Add request ID to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-request-id', requestId);
    
    event.waitUntil(
      Promise.resolve().then(() => {
        const duration = Date.now() - start;
        console.log(
          `[${request.method}] ${new URL(request.url).pathname} ${response.status} ${duration}ms`
        );
      })
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
