import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Client validation
export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const updateClientSchema = createClientSchema.partial();

// Project validation
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client ID is required'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  budget: z.number().positive().optional(),
  deadline: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// Task validation
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// Deliverable validation
export const createDeliverableSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'REJECTED']).optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER']).optional(),
  url: z.string().url().optional(),
});

export const updateDeliverableSchema = createDeliverableSchema.partial();

// Invoice validation
export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  projectId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  dueDate: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    amount: z.number().positive(),
  })).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// Time entry validation
export const createTimeEntrySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  description: z.string().optional(),
  hours: z.number().positive('Hours must be positive'),
  date: z.string().optional(),
  billable: z.boolean().optional(),
});

export const updateTimeEntrySchema = createTimeEntrySchema.partial();

// Validation helper
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}
