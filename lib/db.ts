import { PrismaClient } from '@prisma/client';
import type {
  User,
  Client,
  Project,
  TimeEntry,
  Invoice,
  InvoiceLineItem,
  UserRole,
  LoginCredentials,
  JWTPayload,
} from '@/types';

// PrismaClient singleton
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Re-export types for convenience
export type {
  User,
  Client,
  Project,
  TimeEntry,
  Invoice,
  InvoiceLineItem,
  UserRole,
  LoginCredentials,
  JWTPayload,
};
