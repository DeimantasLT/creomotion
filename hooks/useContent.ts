'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ContentSection {
  id: string;
  key: string;
  type: 'SECTION' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'ARRAY';
  data: any;
  updatedAt: string;
  updatedBy?: string;
}

export interface UseContentOptions {
  refreshTrigger?: number;
}

export function useContent(options: UseContentOptions = {}) {
  const { refreshTrigger = 0 } = options;
  const [content, setContent] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content');
      if (!response.ok) throw new Error('Failed to fetch content');

      const data = await response.json();
      setContent(data.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent, refreshTrigger]);

  const createContent = useCallback(async (data: {
    key: string;
    type: string;
    data: any;
  }) => {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create content');
    }

    const result = await response.json();
    setContent((prev) => [...prev, result.content]);
    return result.content;
  }, []);

  const updateContent = useCallback(async (key: string, data: {
    type?: string;
    data?: any;
  }) => {
    const response = await fetch(`/api/content/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update content');
    }

    const result = await response.json();
    setContent((prev) =>
      prev.map((c) => (c.key === key ? result.content : c))
    );
    return result.content;
  }, []);

  const deleteContent = useCallback(async (key: string) => {
    const response = await fetch(`/api/content/${key}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete content');
    }

    setContent((prev) => prev.filter((c) => c.key !== key));
  }, []);

  return {
    content,
    loading,
    error,
    refresh: fetchContent,
    createContent,
    updateContent,
    deleteContent,
  };
}
