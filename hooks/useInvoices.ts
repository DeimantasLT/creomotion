import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Invoice, InvoiceStatus, Client, Project } from '@/types';

export interface InvoiceWithRelations extends Invoice {
  invoiceDate?: Date;
  client?: {
    id: string;
    name: string;
    email: string;
    company?: string;
    address?: string;
    city?: string;
    companyCode?: string;
    vatCode?: string;
    phone?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

interface UseInvoicesOptions {
  refreshTrigger?: number;
  statusFilter?: InvoiceStatus | null;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const { refreshTrigger = 0, statusFilter = null } = options;
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/invoices';
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, refreshTrigger]);

  // Filtered invoices based on status
  const filteredInvoices = useMemo(() => {
    if (!statusFilter) return invoices;
    return invoices.filter((i) => i.status === statusFilter);
  }, [invoices, statusFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const paidAmount = invoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    const pendingAmount = invoices
      .filter((i) => i.status === 'SENT')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    const notSentAmount = invoices
      .filter((i) => i.status === 'NOT_SENT')
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    return {
      totalInvoiced,
      paidAmount,
      pendingAmount,
      notSentAmount,
    };
  }, [invoices]);

  const createInvoice = useCallback(async (invoiceData: {
    projectId: string;
    clientId: string;
    amount: number;
    status?: InvoiceStatus;
    dueDate?: string;
    lineItems?: {
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
  }) => {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create invoice');
    }

    const data = await response.json();
    setInvoices((prev) => [data.invoice, ...prev]);
    return data.invoice;
  }, []);

  const updateInvoice = useCallback(async (id: string, invoiceData: {
    status?: InvoiceStatus;
    amount?: number;
    dueDate?: string | null;
    paidAt?: string | null;
    lineItems?: {
      id?: string;
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
  }) => {
    const response = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update invoice');
    }

    const data = await response.json();
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? data.invoice : i))
    );
    return data.invoice;
  }, []);

  const updateInvoiceStatus = useCallback(async (id: string, status: InvoiceStatus) => {
    const updateData: any = { status };
    
    // If marking as paid, set paidAt date
    if (status === 'PAID') {
      updateData.paidAt = new Date().toISOString();
    } else if (status === 'NOT_SENT') {
      updateData.paidAt = null;
    }
    
    return updateInvoice(id, updateData);
  }, [updateInvoice]);

  const deleteInvoice = useCallback(async (id: string) => {
    const response = await fetch(`/api/invoices/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete invoice');
    }

    setInvoices((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return {
    invoices,
    filteredInvoices,
    loading,
    error,
    totals,
    refresh: fetchInvoices,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  };
}
