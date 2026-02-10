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
  MoreHorizontal,
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
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
  IN_PROGRESS: { bg: 'bg-black', text: 'text-white', border: 'border-black' },
  REVIEW: { bg: 'bg-[#FFF3E0]', text: 'text-[#FF9800]', border: 'border-[#FF9800]' },
  APPROVED: { bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]', border: 'border-[#4CAF50]' },
  COMPLETED: { bg: 'bg-[#FF2E63]', text: 'text-white', border: 'border-[#FF2E63]' },
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
      className="p-4 text-left cursor-pointer group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xs tracking-[0.2em] text-black/60 group-hover:text-black transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </span>
        <SortIcon field={field} />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="border-b-2 border-black p-4 bg-black">
          <h2
            className="text-[#F5F5F0] font-bold tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            PROJECTS
          </h2>
        </div>
        <div className="p-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-4 animate-pulse">
              <div className="h-12 bg-gray-200 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="border-b-2 border-black p-4 bg-black">
          <h2
            className="text-[#F5F5F0] font-bold tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            PROJECTS
          </h2>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#FF2E63]" />
          <p
            className="text-sm text-black/60"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            [ERROR: {error}]
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search projects..."
            className="w-full border-2 border-black bg-white pl-10 pr-4 py-2 text-sm outline-none focus:bg-black focus:text-white transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border-2 border-black bg-white px-4 py-2 text-sm outline-none focus:bg-black focus:text-white transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
          className="border-2 border-black bg-[#FF2E63] text-white px-4 py-2 font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <Plus className="w-4 h-4" />
          NEW PROJECT
        </button>
      </div>

      {/* Table */}
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black bg-[#F5F5F0]">
                <SortableHeader field="name" label="PROJECT" />
                <SortableHeader field="client" label="CLIENT" />
                <SortableHeader field="status" label="STATUS" />
                <SortableHeader field="budget" label="BUDGET" />
                <th className="p-4 text-left">
                  <span
                    className="text-xs tracking-[0.2em] text-black/60"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ACTIONS
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p
                      className="text-sm text-black/60"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
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
                      className="border-b border-black/10 hover:bg-black/5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="p-4">
                        <p
                          className="font-bold"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {project.name}
                        </p>
                        {project.description && (
                          <p
                            className="text-xs text-black/50 mt-1 truncate max-w-xs"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {project.description}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {project.client?.name || project.clientId}
                        </p>
                        {project.client?.company && (
                          <p className="text-xs text-black/50">
                            {project.client.company}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {project.budget ? `€${project.budget.toLocaleString()}` : '—'}
                        </p>
                        {project.deadline && (
                          <p className="text-xs text-black/50">
                            Due {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => onEdit(project)}
                          className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
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
          <div className="border-t-2 border-black p-4 bg-[#F5F5F0] flex items-center justify-between">
            <span
              className="text-xs text-black/60"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              SHOWING {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredAndSortedProjects.length)} OF{' '}
              {filteredAndSortedProjects.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span
                className="px-4 py-2 border-2 border-black bg-white text-sm"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors disabled:opacity-50"
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
