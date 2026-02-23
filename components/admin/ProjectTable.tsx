'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
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

type SortField = 'name' | 'client' | 'status' | 'budget' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface ProjectTableProps {
  limit?: number;
  refreshTrigger?: number;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-white/10', text: 'text-white', border: 'border-white/20' },
  IN_PROGRESS: { bg: 'bg-[#8338ec]', text: 'text-white', border: 'border-[#8338ec]' },
  REVIEW: { bg: 'bg-[#ffbe0b]', text: 'text-black', border: 'border-[#ffbe0b]' },
  APPROVED: { bg: 'bg-[#3a86ff]', text: 'text-white', border: 'border-[#3a86ff]' },
  COMPLETED: { bg: 'bg-[#ff006e]', text: 'text-white', border: 'border-[#ff006e]' },
};

export default function ProjectTable({ limit, refreshTrigger = 0 }: ProjectTableProps) {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [refreshTrigger]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = useMemo(() => {
    const sorted = [...projects];
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'client':
          aValue = (a.client?.name || '').toLowerCase();
          bValue = (b.client?.name || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return limit ? sorted.slice(0, limit) : sorted;
  }, [projects, sortField, sortDirection, limit]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="p-3 sm:p-4 text-left cursor-pointer group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs tracking-[0.2em] text-white/60 group-hover:text-white transition-colors font-[var(--font-jetbrains-mono)] whitespace-nowrap">
          {label}
        </span>
        <SortIcon field={field} />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
        <div className="border-b border-white/10 p-4 bg-[#0a0a0a]">
          <h2 className="text-white font-bold tracking-wider font-[var(--font-space-grotesk)]">
            PROJECTS
          </h2>
        </div>
        <div className="p-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-4 animate-pulse">
              <div className="h-12 bg-white/5 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
        <div className="border-b border-white/10 p-4 bg-[#0a0a0a]">
          <h2 className="text-white font-bold tracking-wider font-[var(--font-space-grotesk)]">
            PROJECTS
          </h2>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#ff006e]" />
          <p className="text-sm text-white/60 font-[var(--font-jetbrains-mono)]">
            [ERROR: {error}]
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
      <div className="border-b border-white/10 p-4 bg-[#0a0a0a]">
        <h2 className="text-white font-bold tracking-wider font-[var(--font-space-grotesk)]">
          {limit ? 'RECENT PROJECTS' : 'ALL PROJECTS'}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#0a0a0a]">
              <SortableHeader field="name" label="PROJECT" />
              <SortableHeader field="client" label="CLIENT" />
              <SortableHeader field="status" label="STATUS" />
              <SortableHeader field="budget" label="BUDGET" />
            </tr>
          </thead>
          <tbody>
            {sortedProjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-sm text-white/60 font-[var(--font-jetbrains-mono)]">
                    NO PROJECTS FOUND
                  </p>
                </td>
              </tr>
            ) : (
              sortedProjects.map((project, index) => {
                const statusStyle = statusColors[project.status] || statusColors.DRAFT;
                return (
                  <motion.tr
                    key={project.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-3 sm:p-4">
                      <p className="font-bold text-white font-[var(--font-space-grotesk)] break-words max-w-[200px]">
                        {project.name}
                      </p>
                      {project.description && (
                        <p className="text-xs text-white/50 mt-1 truncate max-w-[200px] font-[var(--font-jetbrains-mono)]">
                          {project.description}
                        </p>
                      )}
                    </td>
                    <td className="p-3 sm:p-4">
                      <p className="text-white/80 font-[var(--font-jetbrains-mono)] text-sm whitespace-nowrap">
                        {project.client?.name || project.clientId}
                      </p>
                      {project.client?.company && (
                        <p className="text-xs text-white/50 font-[var(--font-jetbrains-mono)]">
                          {project.client.company}
                        </p>
                      )}
                    </td>
                    <td className="p-3 sm:p-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} rounded font-[var(--font-jetbrains-mono)] whitespace-nowrap`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <p className="text-white/80 font-[var(--font-jetbrains-mono)] text-sm whitespace-nowrap">
                        {project.budget ? `€${project.budget.toLocaleString()}` : '—'}
                      </p>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {limit && projects.length > limit && (
        <div className="border-t border-white/10 p-4 bg-[#0a0a0a]">
          <p className="text-xs text-white/60 text-center font-[var(--font-jetbrains-mono)]">
            SHOWING {limit} OF {projects.length} PROJECTS
          </p>
        </div>
      )}
    </div>
  );
}
