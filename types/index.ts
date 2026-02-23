// Shared Types - ALL agents import from here
// These are the canonical types for Creomotion Platform

// ============================================
// USER TYPES
// ============================================
export type UserRole = 'ADMIN' | 'EDITOR' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Full user with password (server-side only)
export interface UserWithPassword extends User {
  passwordHash: string;
}

// ============================================
// CLIENT TYPES
// ============================================
export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  companyCode?: string | null;
  vatCode?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  _count?: {
    projects?: number;
    invoices?: number;
  };
}

// ============================================
// PROJECT TYPES
// ============================================
export type ProjectStatus = 
  | 'DRAFT' 
  | 'IN_PROGRESS' 
  | 'IN_REVIEW' 
  | 'REVIEW'
  | 'APPROVED' 
  | 'COMPLETED'
  | 'DELIVERED'
  | 'ARCHIVED' 
  | 'CANCELLED';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  client?: Client;
  status: ProjectStatus;
  budget?: number | null;
  progress?: number;
  deadline?: Date | string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  _count?: {
    deliverables?: number;
    timeEntries?: number;
    invoices?: number;
  };
}

// ============================================
// TIME ENTRY TYPES
// ============================================
export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  project?: Project;
  description?: string;
  duration: number; // in minutes
  date: Date | string;
  billable: boolean;
  hourlyRate?: number;
  createdAt?: Date | string;
}

// ============================================
// INVOICE TYPES
// ============================================
export type InvoiceStatus = 
  | 'DRAFT'
  | 'NOT_SENT' 
  | 'SENT' 
  | 'VIEWED'
  | 'PAID' 
  | 'OVERDUE'
  | 'CANCELLED'
  | 'REFUNDED';

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  client?: Client;
  project?: Project;
  invoiceNumber: string;
  amount: number;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  status: InvoiceStatus;
  invoiceDate?: Date | string;
  dueDate?: Date | string;
  paidAt?: Date | string | null;
  issuedAt?: Date | string | null;
  pdfUrl?: string | null;
  lineItems: InvoiceLineItem[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ============================================
// DELIVERABLE TYPES
// ============================================
export type DeliverableStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'IN_REVIEW' 
  | 'APPROVED' 
  | 'DELIVERED'
  | 'REJECTED';

export interface Deliverable {
  id: string;
  name: string;
  description?: string | null;
  projectId: string;
  project?: Project;
  status: DeliverableStatus;
  version: number;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  googleDriveUrl?: string | null;
  googleDriveId?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ============================================
// AUTH TYPES
// ============================================
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

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiError {
  error: string;
  status: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// ============================================
// CMS CONTENT TYPES
// ============================================
export interface Service {
  num: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
}

export interface CMSContent {
  hero: {
    year: string;
    headline1: string;
    headline2: string;
    tagline: string[];
    description: string;
    stats: { num: string; label: string }[];
  };
  about: {
    pretitle: string;
    title1: string;
    title2: string;
    description: string;
    timeline: { year: string; label: string }[];
  };
  projects: { client: string; title: string; year: string; category: string }[];
  services: Service[];
  contact: {
    pretitle: string;
    title1: string;
    title2: string;
    description: string;
    cta: string;
    email: string;
  };
}

// ============================================
// UTILITY TYPES
// ============================================
export type WithCount<T> = T & {
  _count?: Record<string, number>;
};

export type DateToString<T> = {
  [K in keyof T]: T[K] extends Date 
    ? string 
    : T[K] extends Date | null 
    ? string | null 
    : T[K] extends Date | undefined 
    ? string | undefined 
    : T[K];
};
