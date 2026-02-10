'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Client } from '@/types';

interface ClientWithCounts extends Client {
  _count?: {
    projects: number;
    invoices: number;
  };
  projects?: Array<{
    id: string;
    name: string;
    status: string;
    budget?: number;
  }>;
  invoices?: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
}

interface UseClientsOptions {
  refreshTrigger?: number;
}

export function useClients(options: UseClientsOptions = {}) {
  const { refreshTrigger = 0 } = options;
  const [clients, setClients] = useState<ClientWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');

      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients, refreshTrigger]);

  const createClient = useCallback(async (clientData: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  }) => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create client');
    }

    const data = await response.json();
    setClients((prev) => [...prev, data.client].sort((a, b) => a.name.localeCompare(b.name)));
    return data.client;
  }, []);

  const updateClient = useCallback(async (id: string, clientData: {
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
  }) => {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update client');
    }

    const data = await response.json();
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data.client } : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    return data.client;
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete client');
    }

    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getClient = useCallback(async (id: string) => {
    const response = await fetch(`/api/clients/${id}`);
    if (!response.ok) throw new Error('Failed to fetch client');
    const data = await response.json();
    return data.client as ClientWithCounts;
  }, []);

  return {
    clients,
    loading,
    error,
    refresh: fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClient,
  };
}
