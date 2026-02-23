'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Plus,
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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

interface ProjectListProps {
  projects: ProjectWithClient[];
  loading: boolean;
  error: string | null;
  onEdit: (project: ProjectWithClient) => void;
  onCreate: () => void;
  pageSize?: number;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-white/10', text: 'text-white', border: 'border-white/20' },
  IN_PROGRESS: { bg: 'bg-[#8338ec]', text: 'text-white', border: 'border-[#8338ec]' },
  REVIEW: { bg: 'bg-[#ffbe0b]', text: 'text-black', border: 'border-[#ffbe0b]' },
  APPROVED: { bg: 'bg-[#3a86ff]', text: 'text-white', border: 'border-[#3a86ff]' },
  COMPLETED: { bg: 'bg-[#ff006e]', text: 'text-white', border: 'border-[#ff006e]' },
};

export default function ProjectList({
  projects,
  loading,
  error,
  onEdit,
  onCreate,
  pageSize = 10,
}: ProjectListProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.client?.name?.toLowerCase().includes(query) ||
          p.client?.company?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
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

    return filtered;
  }, [projects, sortField, sortDirection, searchQuery, statusFilter]);

  // Paginate
  const totalPages = Math.ceil(filteredAndSortedProjects.length / pageSize);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedProjects.slice(start, start + pageSize);
  }, [filteredAndSortedProjects, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

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
          {[...Array(5)].map((_, i) => (
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search projects..."
            className="w-full bg-[#1a1a1a] border border-white/10 text-white pl-10 pr-4 py-2 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/30 rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto bg-[#1a1a1a] border border-white/10 text-white px-4 py-2 text-sm outline-none focus:border-white/30 transition-colors rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
          >
            <option value="">ALL STATUSES</option>
            <option value="DRAFT">DRAFT</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          {/* Create Button */}
          <button
            onClick={onCreate}
            className="w-full sm:w-auto bg-[#ff006e] text-white px-4 py-2 font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-[#ff006e]/80 transition-colors rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            NEW PROJECT
          </button>
        </div>
      </div>

      {/* Table Container with horizontal scroll */}
      <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#0a0a0a]">
                <SortableHeader field="name" label="PROJECT" />
                <SortableHeader field="client" label="CLIENT" />
                <SortableHeader field="status" label="STATUS" />
                <SortableHeader field="budget" label="BUDGET" />
                <th className="p-3 sm:p-4 text-left">
                  <span className="text-xs tracking-[0.2em] text-white/60 font-[var(--font-jetbrains-mono)]">
                    ACTIONS
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-white/20" />
                    <p className="text-sm text-white/60 font-[var(--font-jetbrains-mono)]">
                      {searchQuery || statusFilter
                        ? 'NO PROJECTS MATCH YOUR SEARCH'
                        : 'NO PROJECTS FOUND'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((project, index) => {
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
                        <p className="font-bold text-white font-[var(--font-space-grotesk)]">
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
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <p className="text-white/80 font-[var(--font-jetbrains-mono)] text-sm whitespace-nowrap">
                          {project.budget ? `€${project.budget.toLocaleString()}` : '—'}
                        </p>
                        {project.deadline && (
                          <p className="text-xs text-white/50 font-[var(--font-jetbrains-mono)]">
                            Due {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <button
                          onClick={() => onEdit(project)}
                          className="p-2 border border-white/10 text-white hover:bg-white/10 transition-colors rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Edit project"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-white/10 p-3 sm:p-4 bg-[#0a0a0a] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-white/60 font-[var(--font-jetbrains-mono)]">
              SHOWING {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredAndSortedProjects.length)} OF{' '}
              {filteredAndSortedProjects.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 sm:px-4 py-2 border border-white/10 text-white/80 text-sm font-[var(--font-jetbrains-mono)] min-h-[44px] flex items-center justify-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
