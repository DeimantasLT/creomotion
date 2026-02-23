import { NextResponse } from 'next/server';
import { errorResponse, ErrorCodes } from '@/lib/api-response';

/**
 * Global API Error Handler
 * Catches all unhandled errors in API routes
 */
export function apiErrorHandler(
  error: unknown,
  context?: string
): NextResponse {
  console.error(`[API Error] ${context || 'Unknown'}:`, error);

  // Known error types
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid JSON', { hint: 'Check request body' }),
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    // Authentication errors
    if (error.message.includes('Unauthorized') || error.message.includes('unauthorized')) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, error.message),
        { status: 401 }
      );
    }

    // Validation errors (could come from Zod)
    if (error.message.includes('validation') || error.name === 'ZodError') {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, error.message),
        { status: 422 }
      );
    }
  }

  // Default: Internal Server Error
  return NextResponse.json(
    errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error'
    ),
    { status: 500 }
  );
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandler(
  handler: (request: Request, context?: { params: Promise<Record<string, string>> }) => Promise<NextResponse>
) {
  return async (request: Request, context?: { params: Promise<Record<string, string>> }) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const url = request.url;
      return apiErrorHandler(error, `API: ${url}`);
    }
  };
}

/**
 * Async wrapper for route handlers
 */
export function asyncHandler<T>(
  fn: () => Promise<T>
): () => Promise<T> {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      throw error; // Let the error bubble up to apiErrorHandler
    }
  };
}
