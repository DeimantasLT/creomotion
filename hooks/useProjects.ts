'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Project } from '@/types';

interface ProjectWithClient extends Project {
  client?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  _count?: {
    timeEntries: number;
    invoices: number;
  };
}

interface UseProjectsOptions {
  refreshTrigger?: number;
  limit?: number;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { refreshTrigger = 0, limit } = options;
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      const projectsData = data.projects || [];
      setProjects(limit ? projectsData.slice(0, limit) : projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, refreshTrigger]);

  const createProject = useCallback(async (projectData: {
    name: string;
    description?: string;
    clientId: string;
    status?: string;
    budget?: number;
    deadline?: string;
  }) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create project');
    }

    const data = await response.json();
    setProjects((prev) => [data.project, ...prev]);
    return data.project;
  }, []);

  const updateProject = useCallback(async (id: string, projectData: {
    name?: string;
    description?: string;
    clientId?: string;
    status?: string;
    budget?: number;
    deadline?: string;
  }) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update project');
    }

    const data = await response.json();
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? data.project : p))
    );
    return data.project;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete project');
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const archiveProject = useCallback(async (id: string) => {
    return updateProject(id, { status: 'COMPLETED' });
  }, [updateProject]);

  return {
    projects,
    loading,
    error,
    refresh: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
  };
}
