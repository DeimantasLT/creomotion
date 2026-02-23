import { describe, it, expect } from 'vitest';
import { 
  loginSchema, 
  createClientSchema, 
  createProjectSchema,
  createTaskSchema,
  validateBody 
} from '../lib/validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123'
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: ''
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createClientSchema', () => {
    it('should validate correct client data', () => {
      const result = createClientSchema.safeParse({
        name: 'Test Client',
        email: 'client@example.com',
        company: 'Test Company'
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const result = createClientSchema.safeParse({
        email: 'client@example.com'
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = createClientSchema.safeParse({
        name: 'Test Client',
        email: 'invalid'
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = createClientSchema.safeParse({
        name: 'Test Client',
        email: 'client@example.com',
        password: '123'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createProjectSchema', () => {
    it('should validate correct project data', () => {
      const result = createProjectSchema.safeParse({
        name: 'Test Project',
        clientId: 'client-123',
        status: 'ACTIVE'
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const result = createProjectSchema.safeParse({
        clientId: 'client-123'
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const result = createProjectSchema.safeParse({
        name: 'Test Project',
        clientId: 'client-123',
        status: 'INVALID_STATUS'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateBody helper', () => {
    it('should return data on valid input', () => {
      const result = validateBody(loginSchema, {
        email: 'test@example.com',
        password: 'password'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should return error on invalid input', () => {
      const result = validateBody(loginSchema, {
        email: 'invalid'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
