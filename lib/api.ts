// API Client for Creomotion Platform
// Fetch wrappers with automatic token handling and error management

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Types
export interface ApiError {
  error: string;
  status: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Fetch wrapper with automatic auth header
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important: sends cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle auth errors
    if (response.status === 401) {
      // Redirect to login on auth failure
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return { error: 'Unauthorized', status: 401 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: errorData.error || `HTTP ${response.status}`, 
        status: response.status 
      };
    }

    // Handle empty responses
    if (response.status === 204) {
      return { data: undefined as T, status: response.status };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { 
      error: error instanceof Error ? error.message : 'Network error', 
      status: 500 
    };
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchWithAuth<{ user: { id: string; email: string; name: string | null; role: string } }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },

  logout: async () => {
    return fetchWithAuth<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  me: async () => {
    return fetchWithAuth<{ user: { id: string; email: string; name: string | null; role: string } }>(
      '/api/auth/me'
    );
  },
};

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

// Users API
export const usersApi = {
  list: async () => {
    return fetchWithAuth<{ users: User[] }>('/api/users');
  },

  create: async (data: { email: string; name?: string; password: string; role?: string }) => {
    return fetchWithAuth<{ user: User }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Client types
export interface Client {
  id: string;
  email: string;
  name: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
}

// Clients API
export const clientsApi = {
  list: async () => {
    return fetchWithAuth<{ clients: Client[] }>('/api/clients');
  },

  get: async (id: string) => {
    return fetchWithAuth<{ client: Client & { projects: Project[] } }>(`/api/clients/${id}`);
  },

  create: async (data: Partial<Client>) => {
    return fetchWithAuth<{ client: Client }>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Client>) => {
    return fetchWithAuth<{ client: Client }>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth<{ success: boolean }>(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Project types
export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'DELIVERED' | 'ARCHIVED' | 'CANCELLED';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  deadline: string | null;
  progress: number;
  clientId: string;
  client?: Client;
  createdAt: string;
  updatedAt: string;
  _count?: { 
    deliverables: number;
    timeEntries: number;
    invoices: number;
  };
}

// Projects API
export const projectsApi = {
  list: async () => {
    return fetchWithAuth<{ projects: Project[] }>('/api/projects');
  },

  get: async (id: string) => {
    return fetchWithAuth<{ project: Project & { deliverables: Deliverable[]; timeEntries: any[]; invoices: any[] } }>(
      `/api/projects/${id}`
    );
  },

  create: async (data: Partial<Project>) => {
    return fetchWithAuth<{ project: Project }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Project>) => {
    return fetchWithAuth<{ project: Project }>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Stats for dashboard
  stats: async () => {
    return fetchWithAuth<{
      activeProjects: number;
      totalClients: number;
      pendingInvoices: number;
      hoursThisMonth: number;
    }>('/api/projects/stats');
  },
};

// Deliverable types
export type DeliverableStatus = 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'DELIVERED' | 'REJECTED';

export interface Deliverable {
  id: string;
  name: string;
  description: string | null;
  status: DeliverableStatus;
  version: number;
  googleDriveUrl: string | null;
  googleDriveId: string | null;
  fileSize: number | null;
  mimeType: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// Deliverables API
export const deliverablesApi = {
  list: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return fetchWithAuth<{ deliverables: Deliverable[] }>(`/api/deliverables${query}`);
  },

  get: async (id: string) => {
    return fetchWithAuth<{ deliverable: Deliverable }>(`/api/deliverables/${id}`);
  },

  create: async (data: Partial<Deliverable>) => {
    return fetchWithAuth<{ deliverable: Deliverable }>('/api/deliverables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Deliverable>) => {
    return fetchWithAuth<{ deliverable: Deliverable }>(`/api/deliverables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth<{ success: boolean }>(`/api/deliverables/${id}`, {
      method: 'DELETE',
    });
  },
};

// Invoice types
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  pdfUrl: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// Invoices API
export const invoicesApi = {
  list: async () => {
    return fetchWithAuth<{ invoices: Invoice[] }>('/api/invoices');
  },

  getTotalPending: async () => {
    return fetchWithAuth<{ total: number }>('/api/invoices/pending');
  },
};

// Re-export all APIs
export const api = {
  auth: authApi,
  users: usersApi,
  clients: clientsApi,
  projects: projectsApi,
  deliverables: deliverablesApi,
  invoices: invoicesApi,
};
