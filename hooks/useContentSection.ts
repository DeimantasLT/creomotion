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

export function useContentSection(key: string) {
  const [section, setSection] = useState<ContentSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSection = useCallback(async () => {
    if (!key) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/content/${key}`);
      if (!response.ok) {
        if (response.status === 404) {
          setSection(null);
          return;
        }
        throw new Error('Failed to fetch content section');
      }

      const data = await response.json();
      setSection(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content section');
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  const updateSection = useCallback(async (data: any) => {
    const response = await fetch(`/api/content/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update content section');
    }

    const result = await response.json();
    setSection(result.content);
    return result.content;
  }, [key]);

  return {
    section,
    data: section?.data,
    loading,
    error,
    refresh: fetchSection,
    update: updateSection,
  };
}
