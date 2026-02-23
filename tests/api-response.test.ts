import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';

describe('API Response Helpers', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const response = successResponse({ user: 'test' });
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ user: 'test' });
      expect(response.meta?.timestamp).toBeDefined();
    });

    it('should include requestId when provided', () => {
      const response = successResponse({ id: 1 }, 'req-123');
      
      expect(response.meta?.requestId).toBe('req-123');
    });
  });

  describe('errorResponse', () => {
    it('should create an error response', () => {
      const response = errorResponse('NOT_FOUND', 'User not found');
      
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NOT_FOUND');
      expect(response.error?.message).toBe('User not found');
    });

    it('should include error details when provided', () => {
      const response = errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        { field: 'email', reason: 'invalid format' }
      );
      
      expect(response.error?.details).toEqual({
        field: 'email',
        reason: 'invalid format'
      });
    });
  });

  describe('ErrorCodes', () => {
    it('should have all common error codes', () => {
      expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCodes.BAD_REQUEST).toBe('BAD_REQUEST');
    });
  });
});
