'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi, projectsApi, deliverablesApi } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  clientId?: string; // populated from client record
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  budget?: number | null;
  deadline: string | null;
  clientId: string;
  createdAt: string;
  deliverables?: Deliverable[];
}

export interface Deliverable {
  id: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'PENDING';
  version: number;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  fileSize: number | null;
  mimeType: string | null;
  googleDriveId: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingApprovals: number;
  approvedThisMonth: number;
}

interface UseClientProjectsReturn {
  user: User | null;
  projects: Project[];
  deliverables: Deliverable[];
  stats: ClientStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClientProjects(): UseClientProjectsReturn {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Get current user
      const { data: meData, error: authError } = await authApi.me();
      
      if (authError || !meData?.user) {
        throw new Error('Not authenticated');
      }

      const currentUser = meData.user;

      // 2. If CLIENT role, find their clientId
      let clientId: string | undefined;
      if (currentUser.role === 'CLIENT') {
        // Fetch all projects to find the one with matching client email
        const { data: allProjects } = await projectsApi.list();
        if (allProjects?.projects) {
          const clientProject = allProjects.projects.find(
            (p: any) => p.client?.email === currentUser.email
          );
          if (clientProject) {
            clientId = clientProject.clientId;
          }
        }
      }

      const userWithClientId = { ...currentUser, clientId };
      setUser(userWithClientId);

      // 3. Fetch projects (filtered for clients)
      let userProjects: Project[] = [];
      if (currentUser.role === 'CLIENT' && clientId) {
        // For clients, filter by their clientId
        const { data: projectsData } = await projectsApi.list();
        if (projectsData?.projects) {
          userProjects = projectsData.projects.filter(
            (p: any) => p.clientId === clientId
          );
        }
      } else {
        // For admin/editor, fetch all
        const { data: projectsData } = await projectsApi.list();
        userProjects = projectsData?.projects || [];
      }
      setProjects(userProjects);

      // 4. Fetch deliverables for these projects
      const projectIds = userProjects.map(p => p.id);
      let userDeliverables: Deliverable[] = [];
      
      if (projectIds.length > 0) {
        // Fetch deliverables for each project
        const deliverablePromises = projectIds.map(async (projectId) => {
          const { data } = await deliverablesApi.list(projectId);
          return data?.deliverables || [];
        });
        
        const deliverablesArrays = await Promise.all(deliverablePromises);
        userDeliverables = deliverablesArrays.flat();
      }
      
      setDeliverables(userDeliverables);

    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate stats
  const stats: ClientStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => 
      p.status === 'IN_PROGRESS' || p.status === 'REVIEW'
    ).length,
    completedProjects: projects.filter(p => 
      p.status === 'APPROVED' || p.status === 'COMPLETED'
    ).length,
    pendingApprovals: deliverables.filter(d => 
      d.status === 'IN_REVIEW'
    ).length,
    approvedThisMonth: deliverables.filter(d => {
      if (d.status !== 'APPROVED') return false;
      const updatedAt = new Date(d.updatedAt);
      const now = new Date();
      return (
        updatedAt.getMonth() === now.getMonth() &&
        updatedAt.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  return {
    user,
    projects,
    deliverables,
    stats,
    isLoading,
    error,
    refetch: fetchData,
  };
}
