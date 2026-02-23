'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TimeEntry } from '@/types';

interface TimeEntryWithRelations extends TimeEntry {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    client?: {
      id: string;
      name: string;
    };
  };
}

interface UseTimeEntriesOptions {
  refreshTrigger?: number;
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
}

export function useTimeEntries(options: UseTimeEntriesOptions = {}) {
  const { refreshTrigger = 0, startDate, endDate, projectId } = options;
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (projectId) params.append('projectId', projectId);

      const url = `/api/time-entries${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch time entries');

      const data = await response.json();
      setTimeEntries(data.timeEntries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time entries');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, projectId]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries, refreshTrigger]);

  const createTimeEntry = useCallback(async (entryData: {
    projectId: string;
    description?: string;
    duration: number;
    date: string;
    billable?: boolean;
    hourlyRate?: number;
  }) => {
    const response = await fetch('/api/time-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create time entry');
    }

    const data = await response.json();
    setTimeEntries((prev) => [data.timeEntry, ...prev]);
    return data.timeEntry;
  }, []);

  const updateTimeEntry = useCallback(async (id: string, entryData: {
    description?: string;
    duration?: number;
    date?: string;
    billable?: boolean;
    projectId?: string;
    hourlyRate?: number;
  }) => {
    const response = await fetch(`/api/time-entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update time entry');
    }

    const data = await response.json();
    setTimeEntries((prev) =>
      prev.map((e) => (e.id === id ? data.timeEntry : e))
    );
    return data.timeEntry;
  }, []);

  const deleteTimeEntry = useCallback(async (id: string) => {
    const response = await fetch(`/api/time-entries/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete time entry');
    }

    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Calculate totals
  const getTodayEntries = useCallback(() => {
    const today = new Date().toDateString();
    return timeEntries.filter((entry) => new Date(entry.date).toDateString() === today);
  }, [timeEntries]);

  const getWeekEntries = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return timeEntries.filter((entry) => new Date(entry.date) >= startOfWeek);
  }, [timeEntries]);

  const calculateTotalHours = useCallback((entries: TimeEntryWithRelations[]) => {
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return Math.round((totalMinutes / 60) * 10) / 10; // Duration is in minutes, convert to hours
  }, []);

  const calculateTotalBillableHours = useCallback((entries: TimeEntryWithRelations[]) => {
    const totalMinutes = entries
      .filter((entry) => entry.billable)
      .reduce((sum, entry) => sum + entry.duration, 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, []);

  return {
    timeEntries,
    loading,
    error,
    refresh: fetchTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    getTodayEntries,
    getWeekEntries,
    calculateTotalHours,
    calculateTotalBillableHours,
  };
}
