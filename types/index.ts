// Shared Types - ALL agents import from here
export type UserRole = 'ADMIN' | 'EDITOR' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'COMPLETED';
  budget?: number;
  deadline?: Date;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  description?: string;
  duration: number;
  date: Date;
  billable: boolean;
  hourlyRate?: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate?: Date;
  paidAt?: Date;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type DeliverableStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  status: DeliverableStatus;
  version: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  googleDriveId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
