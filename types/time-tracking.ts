// Time Tracking Types

export interface Project {
  id: string;
  name: string;
  client: string;
  clientEmail?: string;
  clientAddress?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  description: string;
  duration: number; // in seconds
  billable: boolean;
  startTime: Date;
  endTime?: Date;
  invoiced?: boolean;
  invoiceId?: string;
}

export type TimerState = "idle" | "running" | "paused";

// Invoicing Types

export interface InvoiceLineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  type: "time" | "fixed";
  timeEntryId?: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  projectId: string;
  projectName: string;
  date: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response Types

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

export interface TimeEntriesResponse {
  entries: TimeEntry[];
  totalSeconds: number;
  billableSeconds: number;
  billableAmount: number;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  totalOutstanding: number;
  totalPaid: number;
  totalOverdue: number;
}
